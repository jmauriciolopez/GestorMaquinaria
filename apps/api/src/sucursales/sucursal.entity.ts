import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('sucursales')
export class Sucursal extends BaseEntity {
  @Column({ length: 120 })
  nombre!: string;

  @Column({ nullable: true, type: 'text' })
  direccion?: string;

  @Column({ length: 30, nullable: true })
  telefono?: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ default: true })
  activa: boolean = true;
}
