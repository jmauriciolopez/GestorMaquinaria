import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateModeloActivoDto {
  @IsUUID() categoriaId!: string;
  @IsString() nombre!: string;
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() especificaciones?: Record<string, unknown>;
  @IsOptional() @IsString() imagenUrl?: string;
}

export class UpdateModeloActivoDto {
  @IsOptional() @IsUUID() categoriaId?: string;
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() especificaciones?: Record<string, unknown>;
  @IsOptional() @IsString() imagenUrl?: string;
}
