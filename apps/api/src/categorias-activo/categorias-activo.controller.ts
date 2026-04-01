import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriasActivoService } from './categorias-activo.service';
import { CreateCategoriaActivoDto, UpdateCategoriaActivoDto } from './categoria-activo.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('categorias-activo')
@UseGuards(RolesGuard)
export class CategoriasActivoController {
  constructor(private readonly service: CategoriasActivoService) {}

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
  create(@Body() dto: CreateCategoriaActivoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.tenantId);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaActivoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.update(id, dto, u.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.remove(id, u.tenantId);
  }
}
