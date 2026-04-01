import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

export enum TipoMantenimiento { PREVENTIVO = 'preventivo', CORRECTIVO = 'correctivo' }
export enum EstadoMantenimiento { PROGRAMADO = 'programado', EN_CURSO = 'en_curso', COMPLETADO = 'completado', CANCELADO = 'cancelado' }

@Entity('mantenimientos')
export class Mantenimiento {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId: string;
  @Column({ type: 'enum', enum: TipoMantenimiento }) tipo: TipoMantenimiento;
  @Column({ type: 'enum', enum: EstadoMantenimiento, default: EstadoMantenimiento.PROGRAMADO }) estado: EstadoMantenimiento;
  @Column({ length: 160 }) titulo: string;
  @Column({ nullable: true, type: 'text' }) descripcion?: string;
  @Column({ nullable: true, type: 'text' }) diagnostico?: string;
  @Column({ name: 'tareas_realizadas', nullable: true, type: 'text' }) tareasRealizadas?: string;
  @Column({ name: 'repuestos_usados', type: 'jsonb', nullable: true }) repuestosUsados?: Record<string, unknown>[];
  @Column({ name: 'costo_total', type: 'numeric', precision: 10, scale: 2, nullable: true }) costoTotal?: number;
  @Column({ name: 'fecha_programada', type: 'timestamptz', nullable: true }) fechaProgramada?: Date;
  @Column({ name: 'fecha_inicio', type: 'timestamptz', nullable: true }) fechaInicio?: Date;
  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true }) fechaCierre?: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;

  @OneToMany(() => OrdenTrabajo, (ot) => ot.mantenimiento)
  ordenesTrabajo: OrdenTrabajo[];
}

@Entity('ordenes_trabajo')
export class OrdenTrabajo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'mantenimiento_id', type: 'uuid' }) mantenimientoId: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId: string;
  @Column({ type: 'text' }) descripcion: string;
  @Column({ length: 40, default: 'pendiente' }) estado: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;

  @ManyToOne(() => Mantenimiento, (m) => m.ordenesTrabajo)
  @JoinColumn({ name: 'mantenimiento_id' })
  mantenimiento: Mantenimiento;
}
