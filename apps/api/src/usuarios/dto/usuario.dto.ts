import {
  IsEmail,
  IsString,
  MinLength,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsUUID()
  rolId: string;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsUUID()
  rolId?: string;

  @IsOptional()
  @IsUUID()
  sucursalId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CambiarPasswordDto {
  @IsString()
  @MinLength(8)
  passwordActual: string;

  @IsString()
  @MinLength(8)
  passwordNuevo: string;
}
