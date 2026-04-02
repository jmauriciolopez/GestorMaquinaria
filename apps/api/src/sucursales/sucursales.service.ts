import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from './sucursal.entity';
import { CreateSucursalDto, UpdateSucursalDto } from './sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly repo: Repository<Sucursal>,
  ) {}

  async create(dto: CreateSucursalDto, tenantId: string): Promise<Sucursal> {
    return this.repo.save(this.repo.create({ ...dto, tenantId }));
  }

  async findAll(tenantId: string): Promise<Sucursal[]> {
    return this.repo.find({ where: { tenantId, activa: true }, order: { nombre: 'ASC' } });
  }

  async findOne(id: string, tenantId: string): Promise<Sucursal> {
    const s = await this.repo.findOne({ where: { id, tenantId } });
    if (!s) throw new NotFoundException('Sucursal no encontrada');
    return s;
  }

  async update(id: string, dto: UpdateSucursalDto, tenantId: string): Promise<Sucursal> {
    const s = await this.findOne(id, tenantId);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const s = await this.findOne(id, tenantId);
    s.activa = false;
    await this.repo.save(s);
  }
}
