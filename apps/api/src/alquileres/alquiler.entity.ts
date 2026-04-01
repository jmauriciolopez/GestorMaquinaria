import { Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EstadoAlquiler } from './estado-alquiler.enum';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Activo } from '../activos/activo.entity';

@Entity('alquileres')
// ... (rest of Alquiler class remains same)
export class Alquiler {
  // ... (lines 8-26)
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId: string;
  @Column({ name: 'sucursal_id', type: 'uuid' }) sucursalId: string;
  @Column({ name: 'cliente_id', type: 'uuid' }) clienteId: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId: string;
  @Column({ name: 'reserva_id', type: 'uuid', nullable: true }) reservaId?: string;
  @Column({ type: 'enum', enum: EstadoAlquiler, default: EstadoAlquiler.BORRADOR }) estado: EstadoAlquiler;
  @Column({ name: 'fecha_inicio', type: 'timestamptz' }) fechaInicio: Date;
  @Column({ name: 'fecha_fin_prevista', type: 'timestamptz' }) fechaFinPrevista: Date;
  @Column({ name: 'fecha_fin_real', type: 'timestamptz', nullable: true }) fechaFinReal?: Date;
  @Column({ name: 'subtotal', type: 'numeric', precision: 12, scale: 2, default: 0 }) subtotal: number;
  @Column({ name: 'total_penalidades', type: 'numeric', precision: 12, scale: 2, default: 0 }) totalPenalidades: number;
  @Column({ name: 'total_pagado', type: 'numeric', precision: 12, scale: 2, default: 0 }) totalPagado: number;
  @Column({ nullable: true, type: 'text' }) notas?: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;

  @ManyToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente: Cliente;
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'usuario_id' }) usuario: Usuario;
  @OneToMany(() => AlquilerItem, (i) => i.alquiler, { cascade: true }) items: AlquilerItem[];
}

@Entity('alquiler_items')
export class AlquilerItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'alquiler_id', type: 'uuid' }) alquilerId: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId: string;
  @Column({ name: 'tarifa_id', type: 'uuid', nullable: true }) tarifaId?: string;
  @Column({ name: 'precio_unitario', type: 'numeric', precision: 10, scale: 2 }) precioUnitario: number;
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 }) subtotal: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;

  @ManyToOne(() => Alquiler, (a) => a.items) @JoinColumn({ name: 'alquiler_id' }) alquiler: Alquiler;
  @ManyToOne(() => Activo) @JoinColumn({ name: 'activo_id' }) activo: Activo;
}
