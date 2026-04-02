import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tarifas')
export class Tarifa {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'modelo_id', type: 'uuid', nullable: true }) modeloId?: string;
  @Column({ name: 'activo_id', type: 'uuid', nullable: true }) activoId?: string;
  @Column({ length: 120 }) nombre!: string;
  @Column({ name: 'precio_por_dia', type: 'numeric', precision: 10, scale: 2, nullable: true }) precioPorDia?: number;
  @Column({ name: 'precio_por_semana', type: 'numeric', precision: 10, scale: 2, nullable: true }) precioPorSemana?: number;
  @Column({ name: 'precio_por_mes', type: 'numeric', precision: 10, scale: 2, nullable: true }) precioPorMes?: number;
  @Column({ name: 'deposito_garantia', type: 'numeric', precision: 10, scale: 2, default: 0 }) depositoGarantia: number = 0;
  @Column({ default: true }) vigente: boolean = true;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
