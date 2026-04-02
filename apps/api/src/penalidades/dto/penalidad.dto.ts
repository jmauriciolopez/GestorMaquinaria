import { IsEnum, IsOptional, IsUUID, IsString, IsNumber } from 'class-validator';
import { TipoPenalidad, EstadoPenalidad } from '../penalidad.enum';

export class CreatePenalidadDto {
  @IsUUID() alquilerId!: string;
  @IsOptional() @IsUUID() activoId?: string;
  @IsEnum(TipoPenalidad) tipo!: TipoPenalidad;
  @IsNumber() monto!: number;
  @IsOptional() @IsString() descripcion?: string;
}

export class OverridePenalidadDto {
  @IsNumber() montoOverride!: number;
  @IsOptional() @IsString() descripcion?: string;
}

export class CambiarEstadoPenalidadDto {
  @IsEnum(EstadoPenalidad) estado!: EstadoPenalidad;
}

export class CalcularPenalidadRetrasoDto {
  @IsUUID() alquilerId!: string;
  @IsNumber() horasRetraso!: number;
  @IsNumber() precioPorHora!: number;
}
