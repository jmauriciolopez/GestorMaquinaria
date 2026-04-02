import { Controller, Post, Get, Patch, Body, Headers, BadRequestException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from './guards/roles.guard';
import { CambiarPasswordDto } from '../usuarios/dto/usuario.dto';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('Header x-tenant-id es requerido');
    return this.authService.login(dto, tenantId);
  }

  @Get('me')
  me(@GetUsuario() u: UsuarioActivo) {
    return this.authService.me(u.sub, u.tenantId);
  }

  @Patch('cambiar-password')
  cambiarPassword(@Body() dto: CambiarPasswordDto, @GetUsuario() u: UsuarioActivo) {
    return this.authService.cambiarPassword(u.sub, dto, u.tenantId);
  }
}
