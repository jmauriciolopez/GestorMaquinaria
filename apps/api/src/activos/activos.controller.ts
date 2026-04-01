import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ActivosService } from './activos.service';
import { CreateActivoDto, UpdateActivoDto, FiltroActivoDto } from './dto/activo.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('activos')
@UseGuards(RolesGuard)
export class ActivosController {
  constructor(private readonly service: ActivosService) {}

  @Get()
  findAll(
    @GetUsuario() u: UsuarioActivo,
    @Query() filtro: FiltroActivoDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.service.findAll(u.tenantId, filtro, pagination);
  }

  @Get('stats')
  getStats(@GetUsuario() u: UsuarioActivo) {
    return this.service.getStats(u.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findOne(id, u.tenantId);
  }

  @Post()
  @Roles('admin', 'operador')
  create(@Body() dto: CreateActivoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.tenantId);
  }

  @Patch(':id')
  @Roles('admin', 'operador')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateActivoDto,
    @GetUsuario() u: UsuarioActivo,
  ) {
    return this.service.update(id, dto, u.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.remove(id, u.tenantId);
  }
}
