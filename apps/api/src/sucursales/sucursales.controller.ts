import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto, UpdateSucursalDto } from './sucursal.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';

@Controller('sucursales')
@UseGuards(RolesGuard)
export class SucursalesController {
  constructor(private readonly service: SucursalesService) {}

  @Get()
  findAll(@GetUsuario() u: UsuarioActivo) {
    return this.service.findAll(u.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findOne(id, u.tenantId);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateSucursalDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.tenantId);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateSucursalDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.update(id, dto, u.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.remove(id, u.tenantId);
  }
}
