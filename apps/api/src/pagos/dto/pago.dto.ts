import { IsUUID, IsNumber, IsDateString, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { MetodoPago } from '../metodo-pago.enum';

export class CreatePagoDto {
  @IsUUID() alquilerId!: string;
  @IsNumber() @Min(0.01, { message: 'El monto debe ser mayor a 0' }) monto!: number;
  @IsDateString() fecha!: string;
  @IsEnum(MetodoPago) metodoPago!: MetodoPago;
  @IsOptional() @IsString() referencia?: string;
  @IsOptional() @IsString() notas?: string;
}
