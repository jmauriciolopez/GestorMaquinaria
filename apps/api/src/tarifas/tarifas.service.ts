import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarifa } from './tarifa.entity';
import { CreateTarifaDto, UpdateTarifaDto } from './tarifa.dto';

@Injectable()
export class TarifasService {
  constructor(
    @InjectRepository(Tarifa)
    private readonly repo: Repository<Tarifa>,
  ) {}

  async create(dto: CreateTarifaDto, tenantId: string): Promise<Tarifa> {
    return this.repo.save(this.repo.create({ ...dto, tenantId }));
  }

  async findAll(tenantId: string): Promise<Tarifa[]> {
    return this.repo.find({ where: { tenantId, vigente: true } });
  }

  async findOne(id: string, tenantId: string): Promise<Tarifa> {
    const t = await this.repo.findOne({ where: { id, tenantId } });
    if (!t) throw new NotFoundException('Tarifa no encontrada');
    return t;
  }

  async findPorModelo(modeloId: string, tenantId: string): Promise<Tarifa[]> {
    return this.repo.find({ where: { modeloId, tenantId, vigente: true } });
  }

  async update(id: string, dto: UpdateTarifaDto, tenantId: string): Promise<Tarifa> {
    const t = await this.findOne(id, tenantId);
    Object.assign(t, dto);
    return this.repo.save(t);
  }
}
