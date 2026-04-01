import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModeloActivo } from './modelo-activo.entity';
import { CreateModeloActivoDto, UpdateModeloActivoDto } from './modelo-activo.dto';

@Injectable()
export class ModelosActivoService {
  constructor(
    @InjectRepository(ModeloActivo)
    private readonly repo: Repository<ModeloActivo>,
  ) {}

  async create(dto: CreateModeloActivoDto, tenantId: string): Promise<ModeloActivo> {
    const modelo = this.repo.create({ ...dto, tenantId });
    return this.repo.save(modelo);
  }

  async findAll(tenantId: string, categoriaId?: string): Promise<ModeloActivo[]> {
    const qb = this.repo.createQueryBuilder('m')
      .leftJoinAndSelect('m.categoria', 'cat')
      .where('m.tenant_id = :tenantId', { tenantId });
    if (categoriaId) qb.andWhere('m.categoria_id = :categoriaId', { categoriaId });
    return qb.getMany();
  }

  async findOne(id: string, tenantId: string): Promise<ModeloActivo> {
    const modelo = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['categoria'],
    });
    if (!modelo) throw new NotFoundException('Modelo no encontrado');
    return modelo;
  }

  async update(id: string, dto: UpdateModeloActivoDto, tenantId: string): Promise<ModeloActivo> {
    const modelo = await this.findOne(id, tenantId);
    Object.assign(modelo, dto);
    return this.repo.save(modelo);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const modelo = await this.findOne(id, tenantId);
    await this.repo.remove(modelo);
  }
}
