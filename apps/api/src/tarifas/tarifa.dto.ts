import { IsString, IsOptional, IsUUID, IsNumber, IsBoolean } from 'class-validator';

export class CreateTarifaDto {
  @IsString() nombre: string;
  @IsOptional() @IsUUID() modeloId?: string;
  @IsOptional() @IsUUID() activoId?: string;
  @IsOptional() @IsNumber() precioPorHora?: number;
  @IsOptional() @IsNumber() precioPorDia?: number;
  @IsOptional() @IsNumber() precioPorSemana?: number;
  @IsOptional() @IsNumber() precioPorMes?: number;
  @IsOptional() @IsNumber() depositoGarantia?: number;
}

export class UpdateTarifaDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsNumber() precioPorHora?: number;
  @IsOptional() @IsNumber() precioPorDia?: number;
  @IsOptional() @IsNumber() precioPorSemana?: number;
  @IsOptional() @IsNumber() precioPorMes?: number;
  @IsOptional() @IsNumber() depositoGarantia?: number;
  @IsOptional() @IsBoolean() vigente?: boolean;
}
