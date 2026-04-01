import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MantenimientosService } from './mantenimientos.service';
import { CreateMantenimientoDto, IniciarMantenimientoDto, CerrarMantenimientoDto, CreateOrdenTrabajoDto } from './dto/mantenimiento.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('mantenimientos')
@UseGuards(RolesGuard)
export class MantenimientosController {
  constructor(private readonly service: MantenimientosService) {}

  @Get()
  findAll(@GetUsuario() u: UsuarioActivo) {
    return this.service.findAll(u.tenantId);
  }

  @Get('activo/:activoId')
  findByActivo(@Param('activoId') activoId: string) {
    return this.service.findByActivo(activoId);
  }

  @Post()
  @Roles('admin', 'tecnico')
  create(@Body() dto: CreateMantenimientoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.sub, u.tenantId);
  }

  @Patch(':id/iniciar')
  @Roles('admin', 'tecnico')
  iniciar(@Param('id') id: string, @Body() dto: IniciarMantenimientoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.iniciar(id, dto, u.sub, u.tenantId);
  }

  @Post(':id/ordenes')
  @Roles('admin', 'tecnico')
  registrarOrdenTrabajo(
    @Param('id') id: string,
    @Body() dto: CreateOrdenTrabajoDto,
    @GetUsuario() u: UsuarioActivo,
  ) {
    return this.service.registrarOrdenTrabajo(id, dto, u.sub, u.tenantId);
  }

  @Patch(':id/cerrar')
  @Roles('admin', 'tecnico')
  cerrar(@Param('id') id: string, @Body() dto: CerrarMantenimientoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.cerrar(id, dto, u.sub, u.tenantId);
  }
}
