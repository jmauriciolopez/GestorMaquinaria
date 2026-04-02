import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('clientes')
export class Cliente extends BaseEntity {
  @Column({ length: 120 })
  nombre!: string;

  @Column({ name: 'razon_social', length: 120, nullable: true })
  razonSocial?: string;

  @Column({ length: 30, nullable: true })
  documento?: string;

  @Column({ name: 'tipo_documento', length: 20, nullable: true })
  tipoDocumento?: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 30, nullable: true })
  telefono?: string;

  @Column({ nullable: true, type: 'text' })
  direccion?: string;

  @Column({ nullable: true, type: 'text' })
  notas?: string;

  @Column({ default: true })
  activo: boolean = true;
}
