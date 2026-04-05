import { IsUUID, IsNumber, IsString, IsOptional, IsPositive } from 'class-validator';

export class CrearPreferenciaDto {
  @IsUUID()
  alquilerId!: string;

  @IsNumber()
  @IsPositive()
  monto!: number;

  @IsString()
  descripcion!: string;

  @IsOptional()
  @IsString()
  externalReference?: string;
}
