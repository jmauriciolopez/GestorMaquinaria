import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoActivo } from './movimiento-activo.entity';
import { CreateMovimientoDto } from './dto/movimiento.dto';
import { ActivosService } from '../activos/activos.service';

@Injectable()
export class MovimientosActivoService {
  constructor(
    @InjectRepository(MovimientoActivo)
    private readonly repo: Repository<MovimientoActivo>,
    private readonly activosService: ActivosService,
  ) {}

  async registrar(dto: CreateMovimientoDto, usuarioId: string, tenantId: string): Promise<MovimientoActivo> {
    const activo = await this.activosService.findOne(dto.activoId, tenantId);

    const movimiento = this.repo.create({
      ...dto,
      usuarioId,
      estadoAnterior: activo.estado,
    });

    await this.activosService.cambiarEstado(dto.activoId, dto.estadoNuevo, tenantId);
    return this.repo.save(movimiento);
  }

  async historialPorActivo(activoId: string): Promise<MovimientoActivo[]> {
    return this.repo.find({
      where: { activoId },
      order: { createdAt: 'DESC' },
      relations: ['usuario'],
    });
  }

  async ultimoMovimiento(activoId: string): Promise<MovimientoActivo | null> {
    return this.repo.findOne({
      where: { activoId },
      order: { createdAt: 'DESC' },
      relations: ['usuario'],
    });
  }

  async findByAlquiler(alquilerId: string): Promise<MovimientoActivo[]> {
    return this.repo.find({
      where: { alquilerId },
      order: { createdAt: 'DESC' },
      relations: ['activo'],
    });
  }
}
