import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ModelosActivoService } from './modelos-activo.service';
import { CreateModeloActivoDto, UpdateModeloActivoDto } from './modelo-activo.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('modelos-activo')
@UseGuards(RolesGuard)
export class ModelosActivoController {
  constructor(private readonly service: ModelosActivoService) {}

  @Get()
  findAll(@GetUsuario() u: UsuarioActivo, @Query('categoriaId') categoriaId?: string) {
    return this.service.findAll(u.tenantId, categoriaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findOne(id, u.tenantId);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateModeloActivoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.tenantId);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateModeloActivoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.update(id, dto, u.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.remove(id, u.tenantId);
  }
}
