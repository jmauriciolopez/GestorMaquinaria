import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ModeloActivo } from '../modelos-activo/modelo-activo.entity';

@Entity('categorias_activo')
export class CategoriaActivo extends BaseEntity {
  @Column({ length: 120 })
  nombre!: string;

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @OneToMany(() => ModeloActivo, (m) => m.categoria)
  modelos!: ModeloActivo[];
}
