import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('recordatorios')
@UseGuards(RolesGuard)
export class RecordatoriosController {
  constructor(private readonly service: RecordatoriosService) {}

  @Get()
  @Roles('admin')
  findAll(@GetUsuario() u: UsuarioActivo) {
    return this.service.findAll(u.tenantId);
  }

  @Post(':id/probar')
  @Roles('admin')
  probar(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.probarEnvio(id, u.tenantId);
  }
}
