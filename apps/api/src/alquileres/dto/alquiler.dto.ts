import { IsUUID, IsDateString, IsOptional, IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AlquilerItemDto {
  @IsUUID() activoId: string;
  @IsOptional() @IsUUID() tarifaId?: string;
  @IsNumber() precioUnitario: number;
  @IsOptional() @IsNumber() subtotal?: number;
}

export class CreateAlquilerDto {
  @IsUUID() sucursalId: string;
  @IsUUID() clienteId: string;
  @IsOptional() @IsUUID() reservaId?: string;
  @IsDateString() fechaInicio: string;
  @IsDateString() fechaFinPrevista: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => AlquilerItemDto) items: AlquilerItemDto[];
  @IsOptional() @IsString() notas?: string;
}

export class CheckOutDto {
  @IsUUID() activoId: string;
  @IsOptional() @IsString() condicionSalida?: string;
  @IsOptional() checklistSalida?: Record<string, unknown>;
  @IsOptional() fotosSalida?: string[];
  @IsOptional() @IsString() firmaCliente?: string;
  @IsOptional() @IsString() observaciones?: string;
}
