import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Alquiler } from './alquiler.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Activo } from '../activos/activo.entity';

@Entity('devoluciones_activo')
export class DevolucionActivo {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'alquiler_id', type: 'uuid' }) alquilerId!: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId!: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId!: string;
  
  @Column({ name: 'fecha_devolucion', type: 'timestamptz', default: () => 'NOW()' }) 
  fechaDevolucion!: Date;

  @Column({ name: 'horometro_final', type: 'numeric', precision: 12, scale: 2 }) 
  horometroFinal!: number;

  @Column({ name: 'combustible_final', type: 'int' }) 
  combustibleFinal!: number;

  @Column({ name: 'danos', type: 'jsonb', nullable: true }) 
  danos?: Array<{ descripcion: string; gravedad: string; costoEstimado?: number }>;

  @Column({ nullable: true, type: 'text' }) 
  observaciones?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) 
  createdAt!: Date;

  @ManyToOne(() => Alquiler) @JoinColumn({ name: 'alquiler_id' }) 
  alquiler!: Alquiler;

  @ManyToOne(() => Activo) @JoinColumn({ name: 'activo_id' }) 
  activo!: Activo;

  @ManyToOne(() => Usuario) @JoinColumn({ name: 'usuario_id' }) 
  usuario!: Usuario;
}
