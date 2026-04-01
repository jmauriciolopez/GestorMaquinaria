import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ModeloActivo } from '../modelos-activo/modelo-activo.entity';
import { Sucursal } from '../sucursales/sucursal.entity';
import { EstadoActivo } from './estado-activo.enum';

@Entity('activos')
export class Activo extends BaseEntity {
  @Column({ name: 'sucursal_id', type: 'uuid' })
  sucursalId: string;

  @Column({ name: 'modelo_id', type: 'uuid' })
  modeloId: string;

  @Column({ name: 'codigo_interno', length: 60 })
  codigoInterno: string;

  @Column({ name: 'numero_serie', length: 120, nullable: true })
  numeroSerie?: string;

  @Column({ type: 'enum', enum: EstadoActivo, default: EstadoActivo.DISPONIBLE })
  estado: EstadoActivo;

  @Column({ name: 'ubicacion_actual', nullable: true, type: 'text' })
  ubicacionActual?: string;

  @Column({ name: 'anno_fabricacion', nullable: true, type: 'int' })
  annoFabricacion?: number;

  @Column({ name: 'fecha_adquisicion', nullable: true, type: 'date' })
  fechaAdquisicion?: string;

  @Column({ name: 'valor_adquisicion', nullable: true, type: 'numeric', precision: 12, scale: 2 })
  valorAdquisicion?: number;

  @Column({ nullable: true, type: 'text' })
  notas?: string;

  @ManyToOne(() => ModeloActivo, (m) => m.activos, { eager: true })
  @JoinColumn({ name: 'modelo_id' })
  modelo: ModeloActivo;

  @ManyToOne(() => Sucursal)
  @JoinColumn({ name: 'sucursal_id' })
  sucursal: Sucursal;
}
