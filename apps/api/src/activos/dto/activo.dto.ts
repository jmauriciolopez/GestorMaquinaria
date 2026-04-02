import {
  IsString, IsOptional, IsUUID, IsEnum,
  IsNumber, IsDateString, MaxLength,
} from 'class-validator';
import { EstadoActivo } from '../estado-activo.enum';

export class CreateActivoDto {
  @IsUUID()
  sucursalId!: string;

  @IsUUID()
  modeloId!: string;

  @IsString()
  @MaxLength(60)
  codigoInterno!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  numeroSerie?: string;

  @IsOptional()
  @IsEnum(EstadoActivo)
  estado?: EstadoActivo;

  @IsOptional()
  @IsString()
  ubicacionActual?: string;

  @IsOptional()
  @IsNumber()
  annoFabricacion?: number;

  @IsOptional()
  @IsDateString()
  fechaAdquisicion?: string;

  @IsOptional()
  @IsNumber()
  valorAdquisicion?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateActivoDto {
  @IsOptional() @IsUUID() sucursalId?: string;
  @IsOptional() @IsUUID() modeloId?: string;
  @IsOptional() @IsString() @MaxLength(60) codigoInterno?: string;
  @IsOptional() @IsString() @MaxLength(120) numeroSerie?: string;
  @IsOptional() @IsEnum(EstadoActivo) estado?: EstadoActivo;
  @IsOptional() @IsString() ubicacionActual?: string;
  @IsOptional() @IsNumber() annoFabricacion?: number;
  @IsOptional() @IsDateString() fechaAdquisicion?: string;
  @IsOptional() @IsNumber() valorAdquisicion?: number;
  @IsOptional() @IsString() notas?: string;
}

export class FiltroActivoDto {
  @IsOptional() @IsEnum(EstadoActivo) estado?: EstadoActivo;
  @IsOptional() @IsUUID() sucursalId?: string;
  @IsOptional() @IsUUID() modeloId?: string;
  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsString() busqueda?: string;
}
