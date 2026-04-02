import {
  Entity, Column, ManyToOne, JoinColumn,
  PrimaryGeneratedColumn, CreateDateColumn,
} from 'typeorm';
import { Activo } from '../activos/activo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { TipoMovimiento } from './tipo-movimiento.enum';
import { EstadoActivo } from '../activos/estado-activo.enum';

@Entity('movimientos_activo')
export class MovimientoActivo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'activo_id', type: 'uuid' })
  activoId!: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @Column({ name: 'alquiler_id', type: 'uuid', nullable: true })
  alquilerId?: string;

  @Column({ name: 'mantenimiento_id', type: 'uuid', nullable: true })
  mantenimientoId?: string;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipo!: TipoMovimiento;

  @Column({ name: 'estado_anterior', type: 'enum', enum: EstadoActivo, nullable: true })
  estadoAnterior?: EstadoActivo;

  @Column({ name: 'estado_nuevo', type: 'enum', enum: EstadoActivo })
  estadoNuevo!: EstadoActivo;

  @Column({ name: 'ubicacion_origen', nullable: true, type: 'text' })
  ubicacionOrigen?: string;

  @Column({ name: 'ubicacion_destino', nullable: true, type: 'text' })
  ubicacionDestino?: string;

  @Column({ nullable: true, type: 'text' })
  observaciones?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Activo)
  @JoinColumn({ name: 'activo_id' })
  activo!: Activo;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}
