import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioActivo {
  sub: string;
  email: string;
  rol: string;
  tenantId: string;
  sucursalId?: string;
}

export const GetUsuario = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioActivo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UsuarioActivo;
  },
);
