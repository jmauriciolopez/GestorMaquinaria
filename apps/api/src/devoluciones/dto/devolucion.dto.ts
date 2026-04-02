import { IsUUID, IsOptional, IsString, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DanoDto {
  @IsString() descripcion!: string;
  @IsOptional() @IsNumber() costoEstimado?: number;
  @IsOptional() @IsArray() fotos?: string[];
}

export class CheckInDto {
  @IsUUID() activoId!: string;
  @IsOptional() @IsString() condicionRetorno?: string;
  @IsOptional() checklistRetorno?: Record<string, unknown>;
  @IsOptional() @IsArray() fotosRetorno?: string[];
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsBoolean() tieneDanios?: boolean;
  @IsOptional() @IsBoolean() tieneRetraso?: boolean;
  @IsOptional() @IsNumber() horasRetraso?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => DanoDto) danos?: DanoDto[];
}

export class CreateInspeccionDto {
  @IsUUID() activoId!: string;
  @IsOptional() @IsUUID() devolucionId?: string;
  @IsOptional() @IsString() resultado?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsArray() fotos?: string[];
}
