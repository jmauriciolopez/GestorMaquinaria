import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/pago.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('pagos')
@UseGuards(RolesGuard)
export class PagosController {
  constructor(private readonly service: PagosService) {}

  @Post()
  @Roles('admin', 'operador')
  registrar(@Body() dto: CreatePagoDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.registrar(dto, u.sub, u.tenantId);
  }

  // Debe ir ANTES de :id para que Express no confunda 'dashboard' como un ID
  @Get('dashboard')
  @Roles('admin', 'operador')
  getDashboard(@GetUsuario() u: UsuarioActivo) {
    return this.service.dashboardStats(u.tenantId);
  }

  // Listado global de pagos del tenant (para página de Finanzas)
  @Get()
  @Roles('admin', 'operador')
  findAll(
    @GetUsuario() u: UsuarioActivo,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(u.tenantId, limit ? parseInt(limit, 10) : 100);
  }

  @Get('alquiler/:id')
  findByAlquiler(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findByAlquiler(id, u.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findOne(id, u.tenantId);
  }
}
