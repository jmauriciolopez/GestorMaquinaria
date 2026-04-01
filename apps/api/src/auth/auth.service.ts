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
}
