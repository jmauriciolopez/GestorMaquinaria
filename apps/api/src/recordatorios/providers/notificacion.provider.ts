import { Injectable, Logger } from '@nestjs/common';

export interface NotificacionPayload {
  destinatario: string;
  asunto?: string;
  cuerpo: string;
}

// Interfaz desacoplada — futura integración real implementa esto
export interface INotificacionProvider {
  enviar(payload: NotificacionPayload): Promise<boolean>;
}

@Injectable()
export class EmailProviderMock implements INotificacionProvider {
  private readonly logger = new Logger('EmailProviderMock');
  async enviar(payload: NotificacionPayload): Promise<boolean> {
    this.logger.log(`[EMAIL MOCK] Para: ${payload.destinatario} | Asunto: ${payload.asunto}`);
    this.logger.log(`[EMAIL MOCK] Cuerpo: ${payload.cuerpo.slice(0, 100)}...`);
    return true;
  }
}

@Injectable()
export class WhatsAppProviderMock implements INotificacionProvider {
  private readonly logger = new Logger('WhatsAppProviderMock');
  async enviar(payload: NotificacionPayload): Promise<boolean> {
    this.logger.log(`[WHATSAPP MOCK] Para: ${payload.destinatario} | Mensaje: ${payload.cuerpo.slice(0, 80)}`);
    return true;
  }
}

@Injectable()
export class SmsProviderMock implements INotificacionProvider {
  private readonly logger = new Logger('SmsProviderMock');
  async enviar(payload: NotificacionPayload): Promise<boolean> {
    this.logger.log(`[SMS MOCK] Para: ${payload.destinatario} | Mensaje: ${payload.cuerpo.slice(0, 60)}`);
    return true;
  }
}
