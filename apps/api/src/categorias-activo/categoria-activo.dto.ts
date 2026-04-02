import { IsString, IsOptional } from 'class-validator';

export class CreateCategoriaActivoDto {
  @IsString() nombre!: string;
  @IsOptional() @IsString() descripcion?: string;
}

export class UpdateCategoriaActivoDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() descripcion?: string;
}
