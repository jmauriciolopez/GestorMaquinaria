import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PenalidadesService } from './penalidades.service';
import {
  CreatePenalidadDto,
  OverridePenalidadDto,
  CambiarEstadoPenalidadDto,
  CalcularPenalidadRetrasoDto,
} from './dto/penalidad.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('penalidades')
@UseGuards(RolesGuard)
export class PenalidadesController {
  constructor(private readonly service: PenalidadesService) {}

  // Listado global con relaciones — debe ir ANTES de :id
  @Get()
  @Roles('admin', 'operador')
  findAll(
    @GetUsuario() u: UsuarioActivo,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(u.tenantId, limit ? parseInt(limit, 10) : 200);
  }

  @Get('alquiler/:alquilerId')
  findByAlquiler(@Param('alquilerId') alquilerId: string) {
    return this.service.findByAlquiler(alquilerId);
  }

  @Post()
  @Roles('admin', 'operador')
  create(@Body() dto: CreatePenalidadDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.tenantId);
  }

  @Post('retraso')
  @Roles('admin', 'operador')
  generarRetraso(@Body() dto: CalcularPenalidadRetrasoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.generarPorRetraso(dto, u.tenantId);
  }

  @Patch(':id/override')
  @Roles('admin')
  override(@Param('id') id: string, @Body() dto: OverridePenalidadDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.override(id, dto, u.sub, u.tenantId);
  }

  @Patch(':id/estado')
  @Roles('admin')
  cambiarEstado(@Param('id') id: string, @Body() dto: CambiarEstadoPenalidadDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.cambiarEstado(id, dto, u.sub, u.tenantId);
  }
}
