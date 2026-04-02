import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 60, unique: true })
  nombre!: string;

  @Column({ nullable: true })
  descripcion?: string;

  @Column({ type: 'jsonb', default: [] })
  permisos: string[] = [];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
