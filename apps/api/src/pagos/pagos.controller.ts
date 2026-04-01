import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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

  @Get('alquiler/:id')
  findByAlquiler(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findByAlquiler(id, u.tenantId);
  }

  @Get('dashboard')
  @Roles('admin')
  getBoard(@GetUsuario() u: UsuarioActivo) {
    return this.service.dashboardStats(u.tenantId);
  }
}
