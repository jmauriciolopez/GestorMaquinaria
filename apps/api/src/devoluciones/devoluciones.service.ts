import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevolucionActivo, InspeccionActivo, DanoActivo } from './devolucion.entity';
import { CheckInDto, CreateInspeccionDto } from './dto/devolucion.dto';
import { AlquileresService } from '../alquileres/alquileres.service';
import { ActivosService } from '../activos/activos.service';
import { MovimientosActivoService } from '../movimientos-activo/movimientos-activo.service';
import { EstadoAlquiler } from '../alquileres/estado-alquiler.enum';
import { EstadoActivo } from '../activos/estado-activo.enum';
import { TipoMovimiento } from '../movimientos-activo/tipo-movimiento.enum';

@Injectable()
export class DevolucionesService {
  constructor(
    @InjectRepository(DevolucionActivo) private readonly repo: Repository<DevolucionActivo>,
    @InjectRepository(InspeccionActivo) private readonly inspeccionRepo: Repository<InspeccionActivo>,
    @InjectRepository(DanoActivo) private readonly danoRepo: Repository<DanoActivo>,
    private readonly alquileresService: AlquileresService,
    private readonly activosService: ActivosService,
    private readonly movimientosService: MovimientosActivoService,
  ) {}

  async checkIn(alquilerId: string, dto: CheckInDto, usuarioId: string, tenantId: string): Promise<DevolucionActivo> {
    const alquiler = await this.alquileresService.findOne(alquilerId, tenantId);
    if (alquiler.estado !== EstadoAlquiler.ENTREGADO) {
      throw new BadRequestException('El alquiler debe estar entregado para hacer check-in');
    }

    const devolucion = await this.repo.save(
      this.repo.create({ ...dto, alquilerId, usuarioId, danos: undefined }),
    );

    if (dto.danos?.length) {
      for (const d of dto.danos) {
        await this.danoRepo.save(this.danoRepo.create({ ...d, activoId: dto.activoId, devolucionId: devolucion.id }));
      }
    }

    await this.movimientosService.registrar(
      { activoId: dto.activoId, tipo: TipoMovimiento.CHECK_IN, estadoNuevo: EstadoActivo.DISPONIBLE, alquilerId, observaciones: dto.observaciones },
      usuarioId, tenantId,
    );

    const devoluciones = await this.repo.find({ where: { alquilerId } });
    const totalItems = alquiler.items?.length ?? 0;
    const estado = devoluciones.length >= totalItems ? EstadoAlquiler.DEVUELTO : EstadoAlquiler.DEVUELTO_PARCIAL;
    await this.alquileresService['repo'].update(alquilerId, { estado, fechaFinReal: new Date() });

    return devolucion;
  }

  async crearInspeccion(dto: CreateInspeccionDto, usuarioId: string): Promise<InspeccionActivo> {
    return this.inspeccionRepo.save(this.inspeccionRepo.create({ ...dto, usuarioId }));
  }

  async findByAlquiler(alquilerId: string): Promise<DevolucionActivo[]> {
    return this.repo.find({ where: { alquilerId }, relations: ['usuario'] });
  }

  async findDanosByActivo(activoId: string): Promise<DanoActivo[]> {
    return this.danoRepo.find({ where: { activoId }, order: { createdAt: 'DESC' } });
  }
}
