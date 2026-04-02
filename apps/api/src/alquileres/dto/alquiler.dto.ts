import { IsUUID, IsDateString, IsOptional, IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AlquilerItemDto {
  @IsUUID() activoId!: string;
  @IsOptional() @IsUUID() tarifaId?: string;
  @IsNumber() precioUnitario!: number;
  @IsOptional() @IsNumber() subtotal?: number;
}

export class CreateAlquilerDto {
  @IsUUID() sucursalId!: string;
  @IsUUID() clienteId!: string;
  @IsOptional() @IsUUID() reservaId?: string;
  @IsDateString() fechaInicio!: string;
  @IsDateString() fechaFinPrevista!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => AlquilerItemDto) items!: AlquilerItemDto[];
  @IsOptional() @IsString() notas?: string;
}

export class CheckOutDto {
  @IsUUID() activoId!: string;
  @IsNumber() horometroInicial!: number;
  @IsNumber() combustibleInicial!: number;
  @IsOptional() @IsString() condicionSalida?: string;
  @IsOptional() checklistSalida?: Record<string, unknown>;
  @IsOptional() fotosSalida?: string[];
  @IsOptional() @IsString() firmaCliente?: string;
  @IsOptional() @IsString() observaciones?: string;
}

export class CheckInDto {
  @IsUUID() activoId!: string;
  @IsNumber() horometroFinal!: number;
  @IsNumber() combustibleFinal!: number;
  @IsOptional() @IsArray() danos?: Array<{ descripcion: string; gravedad: string; costoEstimado?: number }>;
  @IsOptional() @IsString() observaciones?: string;
}
