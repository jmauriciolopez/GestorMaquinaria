import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly svc: NotificacionesService) {}

  @Post('token')
  async registrarToken(
    @Body() dto: RegisterTokenDto,
    @Request() req: { user: { sub: string } },
  ) {
    await this.svc.registrarToken(req.user.sub, dto.expoPushToken);
    return { ok: true };
  }
}
