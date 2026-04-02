import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Alquiler } from '../alquileres/alquiler.entity';
import { MetodoPago } from './metodo-pago.enum';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'alquiler_id', type: 'uuid' }) alquilerId!: string;
  @Column({ name: 'usuario_id', type: 'uuid' }) usuarioId!: string;
  
  @Column({ type: 'numeric', precision: 12, scale: 2 }) monto!: number;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) fecha!: Date;
  @Column({ name: 'metodo_pago', type: 'enum', enum: MetodoPago, default: MetodoPago.EFECTIVO }) metodoPago!: MetodoPago;
  
  @Column({ nullable: true, type: 'text' }) referencia?: string;
  @Column({ nullable: true, type: 'text' }) notas?: string;
  
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;

  @ManyToOne(() => Alquiler)
  @JoinColumn({ name: 'alquiler_id' })
  alquiler!: Alquiler;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}
