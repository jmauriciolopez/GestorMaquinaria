import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TarifasService } from './tarifas.service';
import { CreateTarifaDto, UpdateTarifaDto } from './tarifa.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tarifas')
@UseGuards(RolesGuard)
export class TarifasController {
  constructor(private readonly service: TarifasService) {}

  @Get()
  findAll(@GetUsuario() u: UsuarioActivo) {
    return this.service.findAll(u.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findOne(id, u.tenantId);
  }

  @Get('modelo/:modeloId')
  porModelo(@Param('modeloId') modeloId: string, @GetUsuario() u: UsuarioActivo) {
    return this.service.findPorModelo(modeloId, u.tenantId);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateTarifaDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.create(dto, u.tenantId);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateTarifaDto, @GetUsuario() u: UsuarioActivo) {
    return this.service.update(id, dto, u.tenantId);
  }
}
