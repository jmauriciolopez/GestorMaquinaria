import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Penalidad } from './penalidad.entity';
import { TipoPenalidad, EstadoPenalidad } from './penalidad.enum';
import {
  CreatePenalidadDto,
  OverridePenalidadDto,
  CambiarEstadoPenalidadDto,
  CalcularPenalidadRetrasoDto,
} from './dto/penalidad.dto';

@Injectable()
export class PenalidadesService {
  constructor(
    @InjectRepository(Penalidad) private readonly repo: Repository<Penalidad>,
  ) {}

  // Calcula monto de penalidad por retraso: 1.5x precio/hora por cada hora vencida
  calcularMontoRetraso(horasRetraso: number, precioPorHora: number): number {
    return Math.ceil(horasRetraso) * precioPorHora * 1.5;
  }

  async generarPorRetraso(dto: CalcularPenalidadRetrasoDto, tenantId: string): Promise<Penalidad> {
    const monto = this.calcularMontoRetraso(dto.horasRetraso, dto.precioPorHora);
    return this.repo.save(this.repo.create({
      alquilerId: dto.alquilerId,
      tipo: TipoPenalidad.RETRASO,
      monto,
      descripcion: `Retraso de ${dto.horasRetraso.toFixed(1)} horas`,
      tenantId,
    }));
  }

  async create(dto: CreatePenalidadDto, tenantId: string): Promise<Penalidad> {
    return this.repo.save(this.repo.create({ ...dto, tenantId }));
  }

  async findByAlquiler(alquilerId: string): Promise<Penalidad[]> {
    return this.repo.find({ where: { alquilerId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, tenantId: string): Promise<Penalidad> {
    const p = await this.repo.findOne({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Penalidad no encontrada');
    return p;
  }

  async override(id: string, dto: OverridePenalidadDto, usuarioId: string, tenantId: string): Promise<Penalidad> {
    const p = await this.findOne(id, tenantId);
    p.montoOverride = dto.montoOverride;
    if (dto.descripcion) p.descripcion = dto.descripcion;
    p.usuarioAprobadorId = usuarioId;
    return this.repo.save(p);
  }

  async cambiarEstado(id: string, dto: CambiarEstadoPenalidadDto, usuarioId: string, tenantId: string): Promise<Penalidad> {
    const p = await this.findOne(id, tenantId);
    p.estado = dto.estado;
    p.usuarioAprobadorId = usuarioId;
    return this.repo.save(p);
  }

  async totalPendientePorAlquiler(alquilerId: string): Promise<number> {
    const penalidades = await this.repo.find({
      where: { alquilerId, estado: EstadoPenalidad.APROBADA },
    });
    return penalidades.reduce((acc, p) => acc + Number(p.montoOverride ?? p.monto), 0);
  }
}
