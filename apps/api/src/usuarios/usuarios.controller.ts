import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/usuario.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('usuarios')
@UseGuards(RolesGuard)
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @Get()
  @Roles('admin')
  findAll(@GetUsuario() usuario: UsuarioActivo) {
    return this.service.findAll(usuario.tenantId);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string, @GetUsuario() usuario: UsuarioActivo) {
    return this.service.findOne(id, usuario.tenantId);
  }

  @Post()
  @Roles('admin')
  create(
    @Body() dto: CreateUsuarioDto,
    @GetUsuario() usuario: UsuarioActivo,
  ) {
    return this.service.create(dto, usuario.tenantId);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
    @GetUsuario() usuario: UsuarioActivo,
  ) {
    return this.service.update(id, dto, usuario.tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @GetUsuario() usuario: UsuarioActivo) {
    return this.service.remove(id, usuario.tenantId);
  }
}
