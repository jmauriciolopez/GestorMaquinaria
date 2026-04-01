import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto, UpdateReservaDto } from './reserva.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reservas')
@UseGuards(RolesGuard)
export class ReservasController {
  constructor(private readonly service: ReservasService) {}

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
  create(@Body() dto: CreateReservaDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.sub, u.tenantId);
  }

  @Patch(':id')
  @Roles('admin', 'operador')
  update(@Param('id') id: string, @Body() dto: UpdateReservaDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.update(id, dto, u.tenantId);
  }

  @Patch(':id/cancelar')
  @Roles('admin', 'operador')
  cancelar(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.cancelar(id, u.tenantId);
  }
}
