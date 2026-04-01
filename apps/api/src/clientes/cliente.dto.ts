import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateClienteDto {
  @IsString() nombre: string;
  @IsOptional() @IsString() razonSocial?: string;
  @IsOptional() @IsString() documento?: string;
  @IsOptional() @IsString() tipoDocumento?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() notas?: string;
}

export class UpdateClienteDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() razonSocial?: string;
  @IsOptional() @IsString() documento?: string;
  @IsOptional() @IsString() tipoDocumento?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() notas?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}
