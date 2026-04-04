import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NotificacionPayload {
  destinatario: string;
  asunto?: string;
  cuerpo: string;
  htmlCuerpo?: string;
}

export interface INotificacionProvider {
  enviar(payload: NotificacionPayload): Promise<boolean>;
}

// ─── Email con SendGrid ───────────────────────────────────────────────────────

@Injectable()
export class EmailProvider implements INotificacionProvider {
  private readonly logger = new Logger('EmailProvider');
  private readonly modo: string;
  private sgMail: any;

  constructor(private readonly config: ConfigService) {
    this.modo = config.get<string>('notificaciones.modo') ?? 'mock';
    if (this.modo === 'real') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.sgMail = require('@sendgrid/mail');
      this.sgMail.setApiKey(config.get<string>('notificaciones.sendgridApiKey') ?? '');
    }
  }

  async enviar(payload: NotificacionPayload): Promise<boolean> {
    if (this.modo !== 'real') {
      this.logger.log(`[EMAIL MOCK] → ${payload.destinatario} | ${payload.asunto}`);
      return true;
    }
    try {
      await this.sgMail.send({
        to:      payload.destinatario,
        from: {
          email: this.config.get<string>('notificaciones.emailFrom') ?? '',
          name:  this.config.get<string>('notificaciones.emailFromNombre') ?? '',
        },
        subject:  payload.asunto ?? 'Notificación',
        text:     payload.cuerpo,
        html:     payload.htmlCuerpo ?? `<p>${payload.cuerpo}</p>`,
      });
      this.logger.log(`[EMAIL] Enviado a ${payload.destinatario}`);
      return true;
    } catch (err) {
      this.logger.error(`[EMAIL] Error: ${err}`);
      return false;
    }
  }
}

// ─── WhatsApp con Twilio ──────────────────────────────────────────────────────

@Injectable()
export class WhatsAppProvider implements INotificacionProvider {
  private readonly logger = new Logger('WhatsAppProvider');
  private readonly modo: string;
  private twilioClient: any;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.modo = config.get<string>('notificaciones.modo') ?? 'mock';
    this.from = config.get<string>('notificaciones.twilioWhatsappFrom') ?? '';
    if (this.modo === 'real') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const twilio = require('twilio');
      this.twilioClient = twilio(
        config.get<string>('notificaciones.twilioAccountSid'),
        config.get<string>('notificaciones.twilioAuthToken'),
      );
    }
  }

  async enviar(payload: NotificacionPayload): Promise<boolean> {
    if (this.modo !== 'real') {
      this.logger.log(`[WHATSAPP MOCK] → ${payload.destinatario} | ${payload.cuerpo.slice(0, 60)}`);
      return true;
    }
    try {
      const numero = payload.destinatario.startsWith('whatsapp:')
        ? payload.destinatario
        : `whatsapp:${payload.destinatario}`;
      await this.twilioClient.messages.create({
        from: this.from,
        to:   numero,
        body: payload.cuerpo,
      });
      this.logger.log(`[WHATSAPP] Enviado a ${payload.destinatario}`);
      return true;
    } catch (err) {
      this.logger.error(`[WHATSAPP] Error: ${err}`);
      return false;
    }
  }
}

// ─── SMS mock (preparado para Twilio SMS) ─────────────────────────────────────

@Injectable()
export class SmsProviderMock implements INotificacionProvider {
  private readonly logger = new Logger('SmsProvider');
  async enviar(payload: NotificacionPayload): Promise<boolean> {
    this.logger.log(`[SMS MOCK] → ${payload.destinatario} | ${payload.cuerpo.slice(0, 60)}`);
    return true;
  }
}
