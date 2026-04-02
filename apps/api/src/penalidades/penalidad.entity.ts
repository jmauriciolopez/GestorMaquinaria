import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TipoPenalidad, EstadoPenalidad } from './penalidad.enum';
import { Alquiler } from '../alquileres/alquiler.entity';

@Entity('penalidades')
export class Penalidad {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'alquiler_id', type: 'uuid' }) alquilerId!: string;
  @Column({ name: 'activo_id', type: 'uuid', nullable: true }) activoId?: string;
  @Column({ type: 'enum', enum: TipoPenalidad }) tipo!: TipoPenalidad;
  @Column({ type: 'enum', enum: EstadoPenalidad, default: EstadoPenalidad.PENDIENTE }) estado!: EstadoPenalidad;
  @Column({ nullable: true, type: 'text' }) descripcion?: string;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) monto!: number;
  @Column({ name: 'monto_override', type: 'numeric', precision: 10, scale: 2, nullable: true }) montoOverride?: number;
  @Column({ name: 'usuario_aprobador_id', type: 'uuid', nullable: true }) usuarioAprobadorId?: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;

  @ManyToOne(() => Alquiler) @JoinColumn({ name: 'alquiler_id' }) alquiler!: Alquiler;
}
