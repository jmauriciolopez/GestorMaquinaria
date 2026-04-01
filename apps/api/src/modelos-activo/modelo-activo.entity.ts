import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoriaActivo } from '../categorias-activo/categoria-activo.entity';
import { Activo } from '../activos/activo.entity';

@Entity('modelos_activo')
export class ModeloActivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'categoria_id', type: 'uuid' })
  categoriaId: string;

  @Column({ length: 120 })
  nombre: string;

  @Column({ length: 80, nullable: true })
  marca?: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @Column({ type: 'jsonb', nullable: true })
  especificaciones?: Record<string, unknown>;

  @Column({ name: 'imagen_url', nullable: true, type: 'text' })
  imagenUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => CategoriaActivo, (c) => c.modelos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaActivo;

  @OneToMany(() => Activo, (a) => a.modelo)
  activos: Activo[];
}
