import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activo } from './activo.entity';
import { CreateActivoDto, UpdateActivoDto, FiltroActivoDto } from './dto/activo.dto';
import { PaginationDto, paginate, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ActivosService {
  constructor(
    @InjectRepository(Activo)
    private readonly repo: Repository<Activo>,
  ) {}

  async create(dto: CreateActivoDto, tenantId: string): Promise<Activo> {
    const existe = await this.repo.findOne({
      where: { codigoInterno: dto.codigoInterno, tenantId },
    });
    if (existe) throw new ConflictException('El código interno ya existe');
    const activo = this.repo.create({ ...dto, tenantId });
    return this.repo.save(activo);
  }

  async findAll(
    tenantId: string,
    filtro: FiltroActivoDto,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Activo>> {
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.modelo', 'modelo')
      .leftJoinAndSelect('modelo.categoria', 'categoria')
      .where('a.tenant_id = :tenantId', { tenantId })
      .andWhere('a.deleted_at IS NULL');

    if (filtro.estado) qb.andWhere('a.estado = :estado', { estado: filtro.estado });
    if (filtro.sucursalId) qb.andWhere('a.sucursal_id = :sucursalId', { sucursalId: filtro.sucursalId });
    if (filtro.modeloId) qb.andWhere('a.modelo_id = :modeloId', { modeloId: filtro.modeloId });
    if (filtro.categoriaId) qb.andWhere('modelo.categoria_id = :categoriaId', { categoriaId: filtro.categoriaId });
    if (filtro.busqueda) {
      qb.andWhere('(a.codigo_interno ILIKE :b OR a.numero_serie ILIKE :b)', {
        b: `%${filtro.busqueda}%`,
      });
    }

    qb.skip(pagination.skip).take(pagination.limit);
    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, pagination);
  }

  async findOne(id: string, tenantId: string): Promise<Activo> {
    const activo = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['modelo', 'modelo.categoria', 'sucursal'],
    });
    if (!activo) throw new NotFoundException('Activo no encontrado');
    return activo;
  }

  async update(id: string, dto: UpdateActivoDto, tenantId: string): Promise<Activo> {
    const activo = await this.findOne(id, tenantId);
    Object.assign(activo, dto);
    return this.repo.save(activo);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const activo = await this.findOne(id, tenantId);
    await this.repo.softRemove(activo);
  }

  async cambiarEstado(id: string, estado: string, tenantId: string): Promise<Activo> {
    const activo = await this.findOne(id, tenantId);
    activo.estado = estado as Activo['estado'];
    return this.repo.save(activo);
  }
}
