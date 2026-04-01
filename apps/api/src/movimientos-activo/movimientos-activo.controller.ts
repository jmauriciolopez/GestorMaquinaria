import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MovimientosActivoService } from './movimientos-activo.service';
import { CreateMovimientoDto } from './dto/movimiento.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('movimientos-activo')
@UseGuards(RolesGuard)
export class MovimientosActivoController {
  constructor(private readonly service: MovimientosActivoService) {}

  @Post()
  @Roles('admin', 'operador', 'deposito')
  registrar(@Body() dto: CreateMovimientoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.registrar(dto, u.sub, u.tenantId);
  }

  @Get('activo/:activoId')
  historial(@Param('activoId') activoId: string) {
    return this.service.historialPorActivo(activoId);
  }

  @Get('activo/:activoId/ultimo')
  ultimoMovimiento(@Param('activoId') activoId: string) {
    return this.service.ultimoMovimiento(activoId);
  }

  @Get('alquiler/:alquilerId')
  porAlquiler(@Param('alquilerId') alquilerId: string) {
    return this.service.findByAlquiler(alquilerId);
  }
}
