import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AlquileresService } from './alquileres.service';
import { CreateAlquilerDto, CheckOutDto } from './dto/alquiler.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('alquileres')
@UseGuards(RolesGuard)
export class AlquileresController {
  constructor(private readonly service: AlquileresService) {}

  @Get()
  findAll(@GetUsuario() u: UsuarioActivo) {
    return this.service.findAll(u.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findOne(id, u.tenantId);
  }

  @Post()
  @Roles('admin', 'operador')
  create(@Body() dto: CreateAlquilerDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.sub, u.tenantId);
  }

  @Patch(':id/confirmar')
  @Roles('admin', 'operador')
  confirmar(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.confirmar(id, u.tenantId);
  }

  @Post(':id/checkout')
  @Roles('admin', 'operador', 'deposito')
  checkOut(@Param('id') id: string, @Body() dto: CheckOutDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.checkOut(id, dto, u.sub, u.tenantId);
  }

  @Patch(':id/cancelar')
  @Roles('admin')
  cancelar(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.cancelar(id, u.tenantId);
  }
}
