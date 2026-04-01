import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto, UpdateClienteDto } from './cliente.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('clientes')
@UseGuards(RolesGuard)
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Get()
  findAll(@GetUsuario() u: UsuarioActivo, @Query('busqueda') busqueda?: string) {
    return this.service.findAll(u.tenantId, busqueda);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findOne(id, u.tenantId);
  }

  @Post()
  @Roles('admin', 'operador')
  create(@Body() dto: CreateClienteDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.tenantId);
  }

  @Patch(':id')
  @Roles('admin', 'operador')
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.update(id, dto, u.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.remove(id, u.tenantId);
  }
}
