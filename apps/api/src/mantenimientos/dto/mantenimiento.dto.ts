import { IsEnum, IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { TipoMantenimiento } from '../mantenimiento.entity';

export class CreateMantenimientoDto {
  @IsUUID() activoId!: string;
  @IsEnum(TipoMantenimiento) tipo!: TipoMantenimiento;
  @IsString() titulo!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsDateString() fechaProgramada?: string;
  @IsOptional() @IsBoolean() ignorarAlquiler?: boolean;
}

export class IniciarMantenimientoDto {
  @IsOptional() @IsString() diagnostico?: string;
}

export class CerrarMantenimientoDto {
  @IsOptional() @IsString() tareasRealizadas?: string;
  @IsOptional() @IsArray() repuestosUsados?: Record<string, unknown>[];
  @IsOptional() @IsNumber() costoTotal?: number;
  @IsOptional() @IsString() estadoFinalActivo?: string;
}

export class CreateOrdenTrabajoDto {
  @IsString() descripcion!: string;
}
