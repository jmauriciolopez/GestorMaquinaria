import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alquiler, AlquilerItem } from './alquiler.entity';
import { EntregaActivo } from './entrega-activo.entity';
import { DevolucionActivo } from './devolucion-activo.entity';
import { CreateAlquilerDto, CheckOutDto, CheckInDto } from './dto/alquiler.dto';
import { EstadoAlquiler } from './estado-alquiler.enum';
import { EstadoActivo } from '../activos/estado-activo.enum';
import { TipoMovimiento } from '../movimientos-activo/tipo-movimiento.enum';
import { ActivosService } from '../activos/activos.service';
import { MovimientosActivoService } from '../movimientos-activo/movimientos-activo.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class AlquileresService {
  constructor(
    @InjectRepository(Alquiler) private readonly repo: Repository<Alquiler>,
    @InjectRepository(AlquilerItem) private readonly itemRepo: Repository<AlquilerItem>,
    @InjectRepository(EntregaActivo) private readonly entregaRepo: Repository<EntregaActivo>,
    @InjectRepository(DevolucionActivo) private readonly devolucionRepo: Repository<DevolucionActivo>,
    private readonly activosService: ActivosService,
    private readonly movimientosService: MovimientosActivoService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async create(dto: CreateAlquilerDto, usuarioId: string, tenantId: string): Promise<Alquiler> {
    const subtotal = dto.items.reduce((acc, i) => acc + (i.subtotal ?? i.precioUnitario), 0);
    const alquiler = await this.repo.save(
      this.repo.create({ ...dto, usuarioId, tenantId, subtotal }),
    );
    for (const item of dto.items) {
      await this.itemRepo.save(
        this.itemRepo.create({ ...item, alquilerId: alquiler.id, subtotal: item.subtotal ?? item.precioUnitario }),
      );
    }
    // Notificar al usuario que creó el alquiler
    await this.notificaciones.notificarNuevoAlquiler(alquiler.id, usuarioId);
    return this.findOne(alquiler.id, tenantId);
  }

  async findAll(tenantId: string, filtros?: { estado?: EstadoAlquiler; clienteId?: string }): Promise<Alquiler[]> {
    const where: Record<string, unknown> = { tenantId };
    if (filtros?.estado) where['estado'] = filtros.estado;
    if (filtros?.clienteId) where['clienteId'] = filtros.clienteId;
    return this.repo.find({
      where,
      relations: ['cliente', 'usuario', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Alquiler> {
    const a = await this.repo.findOne({ where: { id, tenantId }, relations: ['cliente', 'usuario', 'items'] });
    if (!a) throw new NotFoundException('Alquiler no encontrado');
    return a;
  }

  async confirmar(id: string, tenantId: string): Promise<Alquiler> {
    const a = await this.findOne(id, tenantId);
    if (a.estado !== EstadoAlquiler.BORRADOR) throw new BadRequestException('Solo se puede confirmar un alquiler en borrador');
    a.estado = EstadoAlquiler.CONFIRMADO;
    return this.repo.save(a);
  }

  async checkOut(id: string, dto: CheckOutDto, usuarioId: string, tenantId: string): Promise<EntregaActivo> {
    const alquiler = await this.findOne(id, tenantId);
    if (![EstadoAlquiler.CONFIRMADO, EstadoAlquiler.ENTREGADO].includes(alquiler.estado)) {
      throw new BadRequestException('El alquiler debe estar confirmado para hacer check-out');
    }
    const activo = await this.activosService.findOne(dto.activoId, tenantId);
    if (![EstadoActivo.DISPONIBLE, EstadoActivo.RESERVADO].includes(activo.estado as EstadoActivo)) {
      throw new BadRequestException(`El activo no está disponible para entrega (Estado actual: ${activo.estado})`);
    }

    const entrega = await this.entregaRepo.save(
      this.entregaRepo.create({ ...dto, alquilerId: id, usuarioId }),
    );
    await this.movimientosService.registrar(
      { activoId: dto.activoId, tipo: TipoMovimiento.CHECK_OUT, estadoNuevo: EstadoActivo.ALQUILADO, alquilerId: id, observaciones: dto.observaciones },
      usuarioId, tenantId,
    );
    alquiler.estado = EstadoAlquiler.ENTREGADO;
    await this.repo.save(alquiler);

    // Notificar check-out completado
    await this.notificaciones.notificarCheckOut(id, usuarioId);
    return entrega;
  }

  async checkIn(id: string, dto: CheckInDto, usuarioId: string, tenantId: string): Promise<DevolucionActivo> {
    const alquiler = await this.findOne(id, tenantId);
    if (alquiler.estado !== EstadoAlquiler.ENTREGADO) {
      throw new BadRequestException('El alquiler debe estar en estado ENTREGADO para hacer check-in');
    }

    const devolucion = await this.devolucionRepo.save(
      this.devolucionRepo.create({ ...dto, alquilerId: id, usuarioId }),
    );

    const hasDamages = dto.danos && dto.danos.length > 0;
    const estadoNuevo = hasDamages ? EstadoActivo.EN_MANTENIMIENTO : EstadoActivo.DISPONIBLE;

    await this.movimientosService.registrar(
      {
        activoId: dto.activoId,
        tipo: TipoMovimiento.CHECK_IN,
        estadoNuevo,
        alquilerId: id,
        observaciones: dto.observaciones,
      },
      usuarioId, tenantId,
    );

    alquiler.estado = EstadoAlquiler.FINALIZADO;
    await this.repo.save(alquiler);

    // Notificar check-in completado
    await this.notificaciones.notificarCheckIn(id, usuarioId);
    return devolucion;
  }

  async cancelar(id: string, tenantId: string): Promise<Alquiler> {
    const a = await this.findOne(id, tenantId);
    if (a.estado === EstadoAlquiler.ENTREGADO) throw new BadRequestException('No se puede cancelar un alquiler ya entregado');
    a.estado = EstadoAlquiler.CANCELADO;
    return this.repo.save(a);
  }

  async getStats(tenantId: string) {
    const stats = await this.repo
      .createQueryBuilder('a')
      .select('a.estado', 'estado')
      .addSelect('COUNT(*)', 'count')
      .where('a.tenantId = :tenantId', { tenantId })
      .groupBy('a.estado')
      .getRawMany();

    return stats.reduce((acc, curr) => {
      acc[curr.estado] = parseInt(curr.count, 10);
      return acc;
    }, {} as Record<string, number>);
  }
}
