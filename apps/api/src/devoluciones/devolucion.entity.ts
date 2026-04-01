import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Alquiler } from '../alquileres/alquiler.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('devoluciones_activo')
export class DevolucionActivo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'alquiler_id', type: 'uuid' }) alquilerId: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId: string;
  @Column({ name: 'fecha_devolucion', type: 'timestamptz', default: () => 'NOW()' }) fechaDevolucion: Date;
  @Column({ name: 'condicion_retorno', nullable: true, type: 'text' }) condicionRetorno?: string;
  @Column({ name: 'checklist_retorno', type: 'jsonb', nullable: true }) checklistRetorno?: Record<string, unknown>;
  @Column({ name: 'fotos_retorno', type: 'jsonb', nullable: true }) fotosRetorno?: string[];
  @Column({ nullable: true, type: 'text' }) observaciones?: string;
  @Column({ name: 'tiene_danios', default: false }) tieneDanios: boolean;
  @Column({ name: 'tiene_retraso', default: false }) tieneRetraso: boolean;
  @Column({ name: 'horas_retraso', type: 'numeric', precision: 8, scale: 2, default: 0 }) horasRetraso: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;

  @ManyToOne(() => Alquiler) @JoinColumn({ name: 'alquiler_id' }) alquiler: Alquiler;
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'usuario_id' }) usuario: Usuario;
}

@Entity('inspecciones_activo')
export class InspeccionActivo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId: string;
  @Column({ name: 'devolucion_id', type: 'uuid', nullable: true }) devolucionId?: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId: string;
  @Column({ name: 'fecha', type: 'timestamptz', default: () => 'NOW()' }) fecha: Date;
  @Column({ nullable: true, type: 'text' }) resultado?: string;
  @Column({ nullable: true, type: 'text' }) observaciones?: string;
  @Column({ type: 'jsonb', nullable: true }) fotos?: string[];
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}

@Entity('danos_activo')
export class DanoActivo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId: string;
  @Column({ name: 'devolucion_id', type: 'uuid', nullable: true }) devolucionId?: string;
  @Column({ name: 'inspeccion_id', type: 'uuid', nullable: true }) inspeccionId?: string;
  @Column({ type: 'text' }) descripcion: string;
  @Column({ name: 'costo_estimado', type: 'numeric', precision: 10, scale: 2, nullable: true }) costoEstimado?: number;
  @Column({ type: 'jsonb', nullable: true }) fotos?: string[];
  @Column({ default: false }) resuelto: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
