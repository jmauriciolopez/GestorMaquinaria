import {
  Controller, Post, Body, Headers, HttpCode,
  RawBodyRequest, Req, Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { MercadoPagoService } from './mercadopago.service';
import { CrearPreferenciaDto } from './dto/preferencia.dto';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('pagos/mp')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(private readonly mpService: MercadoPagoService) {}

  /**
   * Crea preferencia de pago en MP y devuelve el link de pago.
   * El frontend redirige al usuario a initPoint o sandboxInitPoint.
   */
  @Post('preference')
  crearPreferencia(
    @Body() dto: CrearPreferenciaDto,
    @GetUsuario() usuario: UsuarioActivo,
  ) {
    return this.mpService.crearPreferencia({
      ...dto,
      tenantId:  usuario.tenantId,
      usuarioId: usuario.sub,
    });
  }

  /**
   * Webhook de MercadoPago — debe ser público (MP no manda JWT).
   * Registrar esta URL en la config de la app de MP.
   */
  @Public()
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: Request) {
    const body = req.body as Record<string, unknown>;
    this.logger.log(`Webhook MP recibido: type=${body['type']}`);
    await this.mpService.procesarWebhook(body);
    return { ok: true };
  }
}
