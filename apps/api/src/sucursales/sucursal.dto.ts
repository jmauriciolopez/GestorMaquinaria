import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateSucursalDto {
  @IsString() nombre!: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsEmail() email?: string;
}

export class UpdateSucursalDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsBoolean() activa?: boolean;
}
