import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioActivo } from '../../common/decorators/get-usuario.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret') ?? 'secret',
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    rol: string;
    tenantId: string;
    sucursalId?: string;
  }): UsuarioActivo {
    return {
      sub: payload.sub,
      email: payload.email,
      rol: payload.rol,
      tenantId: payload.tenantId,
      sucursalId: payload.sucursalId,
    };
  }
}
