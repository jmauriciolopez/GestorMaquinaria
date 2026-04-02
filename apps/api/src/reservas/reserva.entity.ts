import { Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EstadoReserva } from './estado-reserva.enum';
import { Cliente } from '../clientes/cliente.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'sucursal_id', type: 'uuid' }) sucursalId!: string;
  @Column({ name: 'cliente_id', type: 'uuid' }) clienteId!: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId!: string;
  @Column({ type: 'enum', enum: EstadoReserva, default: EstadoReserva.PENDIENTE }) estado!: EstadoReserva;
  @Column({ name: 'fecha_inicio', type: 'timestamptz' }) fechaInicio!: Date;
  @Column({ name: 'fecha_fin', type: 'timestamptz' }) fechaFin!: Date;
  @Column({ nullable: true, type: 'text' }) notas?: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;

  @ManyToOne(() => Cliente) @JoinColumn({ name: 'cliente_id' }) cliente!: Cliente;
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'usuario_id' }) usuario!: Usuario;
}

@Entity('reserva_items')
export class ReservaItem {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'reserva_id', type: 'uuid' }) reservaId!: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
