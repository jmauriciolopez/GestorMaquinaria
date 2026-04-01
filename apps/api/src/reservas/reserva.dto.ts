import { IsUUID, IsDateString, IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { EstadoReserva } from './estado-reserva.enum';

export class CreateReservaDto {
  @IsUUID() sucursalId: string;
  @IsUUID() clienteId: string;
  @IsDateString() fechaInicio: string;
  @IsDateString() fechaFin: string;
  @IsArray() @IsUUID(undefined, { each: true }) activoIds: string[];
  @IsOptional() @IsString() notas?: string;
}

export class UpdateReservaDto {
  @IsOptional() @IsEnum(EstadoReserva) estado?: EstadoReserva;
  @IsOptional() @IsDateString() fechaInicio?: string;
  @IsOptional() @IsDateString() fechaFin?: string;
  @IsOptional() @IsString() notas?: string;
}
