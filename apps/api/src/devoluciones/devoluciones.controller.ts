import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DevolucionesService } from './devoluciones.service';
import { CheckInDto, CreateInspeccionDto } from './dto/devolucion.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('devoluciones')
@UseGuards(RolesGuard)
export class DevolucionesController {
  constructor(private readonly service: DevolucionesService) {}

  @Post('alquiler/:alquilerId/checkin')
  @Roles('admin', 'operador', 'deposito')
  checkIn(
    @Param('alquilerId') alquilerId: string,
    @Body() dto: CheckInDto,
    @GetUsuario() u: UsuarioActivo,
  ) {
    return this.service.checkIn(alquilerId, dto, u.sub, u.tenantId);
  }

  @Post('inspecciones')
  @Roles('admin', 'operador', 'tecnico')
  crearInspeccion(@Body() dto: CreateInspeccionDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.crearInspeccion(dto, u.sub);
  }

  @Get('alquiler/:alquilerId')
  findByAlquiler(@Param('alquilerId') alquilerId: string) {
    return this.service.findByAlquiler(alquilerId);
  }

  @Get('danos/activo/:activoId')
  findDanosByActivo(@Param('activoId') activoId: string) {
    return this.service.findDanosByActivo(activoId);
  }
}
