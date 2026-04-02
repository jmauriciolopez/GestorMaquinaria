import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Rol } from '../roles/rol.entity';
import { Sucursal } from '../sucursales/sucursal.entity';

@Entity('usuarios')
export class Usuario extends BaseEntity {
  @Column({ name: 'sucursal_id', type: 'uuid', nullable: true })
  sucursalId?: string;

  @Column({ name: 'rol_id', type: 'uuid' })
  rolId!: string;

  @Column({ length: 120 })
  nombre!: string;

  @Column({ length: 120, unique: false })
  email!: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash!: string;

  @Column({ default: true })
  activo: boolean = true;

  @Column({ name: 'ultimo_login', type: 'timestamptz', nullable: true })
  ultimoLogin?: Date;

  @ManyToOne(() => Rol, { eager: true })
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol;
}
