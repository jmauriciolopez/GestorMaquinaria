import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaActivo } from './categoria-activo.entity';
import { CreateCategoriaActivoDto, UpdateCategoriaActivoDto } from './categoria-activo.dto';

@Injectable()
export class CategoriasActivoService {
  constructor(
    @InjectRepository(CategoriaActivo)
    private readonly repo: Repository<CategoriaActivo>,
  ) {}

  async create(dto: CreateCategoriaActivoDto, tenantId: string): Promise<CategoriaActivo> {
    const cat = this.repo.create({ ...dto, tenantId });
    return this.repo.save(cat);
  }

  async findAll(tenantId: string): Promise<CategoriaActivo[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<CategoriaActivo> {
    const cat = await this.repo.findOne({ where: { id, tenantId } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async update(id: string, dto: UpdateCategoriaActivoDto, tenantId: string): Promise<CategoriaActivo> {
    const cat = await this.findOne(id, tenantId);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const cat = await this.findOne(id, tenantId);
    await this.repo.softRemove(cat);
  }
}
