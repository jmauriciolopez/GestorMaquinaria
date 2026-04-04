import {
  Entity, Column, ManyToOne, JoinColumn,
  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Alquiler } from '../alquileres/alquiler.entity';
import { MetodoPago } from './metodo-pago.enum';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'alquiler_id', type: 'uuid' }) alquilerId!: string;
  @Column({ name: 'usuario_id', type: 'uuid', nullable: true }) usuarioId?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 }) monto!: number;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) fecha!: Date;
  @Column({ name: 'metodo_pago', type: 'enum', enum: MetodoPago, default: MetodoPago.EFECTIVO })
  metodoPago!: MetodoPago;

  @Column({ nullable: true, type: 'text' }) referencia?: string;
  @Column({ nullable: true, type: 'text' }) notas?: string;

  // Campos MercadoPago
  @Column({ name: 'mp_preference_id', nullable: true, type: 'text' }) mpPreferenceId?: string;
  @Column({ name: 'mp_payment_id', nullable: true, type: 'text' }) mpPaymentId?: string;
  @Column({ name: 'mp_status', nullable: true, length: 40 }) mpStatus?: string;
  @Column({ name: 'mp_external_reference', nullable: true, type: 'text' }) mpExternalReference?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;

  @ManyToOne(() => Alquiler) @JoinColumn({ name: 'alquiler_id' }) alquiler!: Alquiler;
  @ManyToOne(() => Usuario)  @JoinColumn({ name: 'usuario_id' })  usuario!: Usuario;
}
