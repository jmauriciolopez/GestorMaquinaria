import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum TipoRecordatorio {
  VENCIMIENTO_ALQUILER = 'vencimiento_alquiler',
  DEVOLUCION_PENDIENTE = 'devolucion_pendiente',
  MANTENIMIENTO_PROXIMO = 'mantenimiento_proximo',
  RESERVA_PENDIENTE = 'reserva_pendiente',
  PAGO_PENDIENTE = 'pago_pendiente',
}

export enum CanalNotificacion {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  PUSH = 'push',
}

@Entity('recordatorios')
export class Recordatorio {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId: string;
  @Column({ type: 'enum', enum: TipoRecordatorio }) tipo: TipoRecordatorio;
  @Column({ type: 'enum', enum: CanalNotificacion, default: CanalNotificacion.EMAIL }) canal: CanalNotificacion;
  @Column({ length: 160 }) destinatario: string;
  @Column({ name: 'referencia_id', type: 'uuid', nullable: true }) referenciaId?: string;
  @Column({ name: 'referencia_tipo', length: 60, nullable: true }) referenciaTipo?: string;
  @Column({ length: 200, nullable: true }) asunto?: string;
  @Column({ type: 'text', nullable: true }) cuerpo?: string;
  @Column({ default: false }) enviado: boolean;
  @Column({ name: 'fecha_envio', type: 'timestamptz', nullable: true }) fechaEnvio?: Date;
  @Column({ type: 'text', nullable: true }) error?: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
