import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alquiler, AlquilerItem } from './alquiler.entity';
import { EntregaActivo } from './entrega-activo.entity';
import { CreateAlquilerDto, CheckOutDto } from './dto/alquiler.dto';
import { EstadoAlquiler } from './estado-alquiler.enum';
import { EstadoActivo } from '../activos/estado-activo.enum';
import { TipoMovimiento } from '../movimientos-activo/tipo-movimiento.enum';
import { ActivosService } from '../activos/activos.service';
import { MovimientosActivoService } from '../movimientos-activo/movimientos-activo.service';

@Injectable()
export class AlquileresService {
  constructor(
    @InjectRepository(Alquiler) private readonly repo: Repository<Alquiler>,
    @InjectRepository(AlquilerItem) private readonly itemRepo: Repository<AlquilerItem>,
    @InjectRepository(EntregaActivo) private readonly entregaRepo: Repository<EntregaActivo>,
    private readonly activosService: ActivosService,
    private readonly movimientosService: MovimientosActivoService,
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
    return this.findOne(alquiler.id, tenantId);
  }

  async findAll(tenantId: string): Promise<Alquiler[]> {
    return this.repo.find({
      where: { tenantId },
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
    if (activo.estado === EstadoActivo.ALQUILADO) throw new BadRequestException('El activo ya fue entregado');

    const entrega = await this.entregaRepo.save(
      this.entregaRepo.create({ ...dto, alquilerId: id, usuarioId }),
    );
    await this.movimientosService.registrar(
      { activoId: dto.activoId, tipo: TipoMovimiento.CHECK_OUT, estadoNuevo: EstadoActivo.ALQUILADO, alquilerId: id, observaciones: dto.observaciones },
      usuarioId, tenantId,
    );
    alquiler.estado = EstadoAlquiler.ENTREGADO;
    await this.repo.save(alquiler);
    return entrega;
  }

  async cancelar(id: string, tenantId: string): Promise<Alquiler> {
    const a = await this.findOne(id, tenantId);
    if (a.estado === EstadoAlquiler.ENTREGADO) throw new BadRequestException('No se puede cancelar un alquiler ya entregado');
    a.estado = EstadoAlquiler.CANCELADO;
    return this.repo.save(a);
  }
}
