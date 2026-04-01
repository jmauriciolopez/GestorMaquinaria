import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Alquiler } from './alquiler.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('entregas_activo')
export class EntregaActivo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'alquiler_id', type: 'uuid' }) alquilerId: string;
  @Column({ name: 'activo_id', type: 'uuid' }) activoId: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId: string;
  @Column({ name: 'fecha_entrega', type: 'timestamptz', default: () => 'NOW()' }) fechaEntrega: Date;
  @Column({ name: 'condicion_salida', nullable: true, type: 'text' }) condicionSalida?: string;
  @Column({ name: 'checklist_salida', type: 'jsonb', nullable: true }) checklistSalida?: Record<string, unknown>;
  @Column({ name: 'fotos_salida', type: 'jsonb', nullable: true }) fotosSalida?: string[];
  @Column({ name: 'firma_cliente', nullable: true, type: 'text' }) firmaCliente?: string;
  @Column({ nullable: true, type: 'text' }) observaciones?: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;

  @ManyToOne(() => Alquiler) @JoinColumn({ name: 'alquiler_id' }) alquiler: Alquiler;
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'usuario_id' }) usuario: Usuario;
}
