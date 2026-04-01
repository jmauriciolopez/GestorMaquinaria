import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, ReservaItem } from './reserva.entity';
import { CreateReservaDto, UpdateReservaDto } from './reserva.dto';
import { EstadoReserva } from './estado-reserva.enum';
import { EstadoActivo } from '../activos/estado-activo.enum';
import { ActivosService } from '../activos/activos.service';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva) private readonly repo: Repository<Reserva>,
    @InjectRepository(ReservaItem) private readonly itemRepo: Repository<ReservaItem>,
    private readonly activosService: ActivosService,
  ) {}

  async create(dto: CreateReservaDto, usuarioId: string, tenantId: string): Promise<Reserva> {
    for (const activoId of dto.activoIds) {
      const activo = await this.activosService.findOne(activoId, tenantId);
      if (activo.estado !== EstadoActivo.DISPONIBLE) {
        throw new BadRequestException(`Activo ${activo.codigoInterno} no está disponible`);
      }
    }
    const reserva = await this.repo.save(
      this.repo.create({ ...dto, usuarioId, tenantId }),
    );
    for (const activoId of dto.activoIds) {
      await this.itemRepo.save(this.itemRepo.create({ reservaId: reserva.id, activoId }));
      await this.activosService.cambiarEstado(activoId, EstadoActivo.RESERVADO, tenantId);
    }
    return this.findOne(reserva.id, tenantId);
  }

  async findAll(tenantId: string): Promise<Reserva[]> {
    return this.repo.find({ where: { tenantId }, relations: ['cliente', 'usuario'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, tenantId: string): Promise<Reserva> {
    const r = await this.repo.findOne({ where: { id, tenantId }, relations: ['cliente', 'usuario'] });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    return r;
  }

  async update(id: string, dto: UpdateReservaDto, tenantId: string): Promise<Reserva> {
    const r = await this.findOne(id, tenantId);
    Object.assign(r, dto);
    return this.repo.save(r);
  }

  async cancelar(id: string, tenantId: string): Promise<Reserva> {
    const r = await this.findOne(id, tenantId);
    const items = await this.itemRepo.find({ where: { reservaId: id } });
    for (const item of items) {
      await this.activosService.cambiarEstado(item.activoId, EstadoActivo.DISPONIBLE, tenantId);
    }
    r.estado = EstadoReserva.CANCELADA;
    return this.repo.save(r);
  }
}
