import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { TipoMovimiento } from '../tipo-movimiento.enum';
import { EstadoActivo } from '../../activos/estado-activo.enum';

export class CreateMovimientoDto {
  @IsUUID() activoId: string;
  @IsEnum(TipoMovimiento) tipo: TipoMovimiento;
  @IsEnum(EstadoActivo) estadoNuevo: EstadoActivo;
  @IsOptional() @IsUUID() alquilerId?: string;
  @IsOptional() @IsUUID() mantenimientoId?: string;
  @IsOptional() @IsString() ubicacionOrigen?: string;
  @IsOptional() @IsString() ubicacionDestino?: string;
  @IsOptional() @IsString() observaciones?: string;
}
