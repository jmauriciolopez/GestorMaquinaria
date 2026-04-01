import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto, UpdateClienteDto } from './cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly repo: Repository<Cliente>,
  ) {}

  async create(dto: CreateClienteDto, tenantId: string): Promise<Cliente> {
    return this.repo.save(this.repo.create({ ...dto, tenantId }));
  }

  async findAll(tenantId: string, busqueda?: string): Promise<Cliente[]> {
    if (busqueda) {
      return this.repo.find({
        where: [
          { tenantId, nombre: Like(`%${busqueda}%`) },
          { tenantId, documento: Like(`%${busqueda}%`) },
        ],
      });
    }
    return this.repo.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<Cliente> {
    const c = await this.repo.findOne({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('Cliente no encontrado');
    return c;
  }

  async update(id: string, dto: UpdateClienteDto, tenantId: string): Promise<Cliente> {
    const c = await this.findOne(id, tenantId);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const c = await this.findOne(id, tenantId);
    await this.repo.softRemove(c);
  }
}
