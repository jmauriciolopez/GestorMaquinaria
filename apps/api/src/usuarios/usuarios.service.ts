import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './dto/usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto, tenantId: string): Promise<Usuario> {
    const existe = await this.repo.findOne({
      where: { email: dto.email, tenantId },
    });
    if (existe) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = this.repo.create({
      ...dto,
      tenantId,
      passwordHash,
    });
    return this.repo.save(usuario);
  }

  async findAll(tenantId: string): Promise<Usuario[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<Usuario> {
    const usuario = await this.repo.findOne({ where: { id, tenantId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async findByEmailConPassword(
    email: string,
    tenantId: string,
  ): Promise<Usuario | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .leftJoinAndSelect('u.rol', 'rol')
      .where('u.email = :email AND u.tenantId = :tenantId', { email, tenantId })
      .getOne();
  }

  async update(
    id: string,
    dto: UpdateUsuarioDto,
    tenantId: string,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id, tenantId);
    Object.assign(usuario, dto);
    return this.repo.save(usuario);
  }

  async actualizarUltimoLogin(id: string): Promise<void> {
    await this.repo.update(id, { ultimoLogin: new Date() });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const usuario = await this.findOne(id, tenantId);
    await this.repo.softRemove(usuario);
  }
}
