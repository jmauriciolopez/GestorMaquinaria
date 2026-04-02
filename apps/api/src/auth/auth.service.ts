import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CambiarPasswordDto } from '../usuarios/dto/usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, tenantId: string): Promise<AuthResponseDto> {
    const usuario = await this.usuariosService.findByEmailConPassword(
      dto.email,
      tenantId,
    );

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    if (!usuario.activo) throw new UnauthorizedException('Usuario inactivo');

    const passwordValida = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );
    if (!passwordValida)
      throw new UnauthorizedException('Credenciales inválidas');

    await this.usuariosService.actualizarUltimoLogin(usuario.id);

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
      tenantId: usuario.tenantId,
      sucursalId: usuario.sucursalId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
        tenantId: usuario.tenantId,
        sucursalId: usuario.sucursalId,
      },
    };
  }

  async me(usuarioId: string, tenantId: string) {
    return this.usuariosService.findOne(usuarioId, tenantId);
  }

  async cambiarPassword(usuarioId: string, dto: CambiarPasswordDto, tenantId: string): Promise<{ ok: boolean }> {
    const usuario = await this.usuariosService.findByIdConPassword(usuarioId, tenantId);
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    const valida = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!valida) throw new UnauthorizedException('La contraseña actual es incorrecta');

    const passwordHash = await bcrypt.hash(dto.passwordNuevo, 10);
    await this.usuariosService.actualizarPassword(usuarioId, passwordHash);
    return { ok: true };
  }
}
