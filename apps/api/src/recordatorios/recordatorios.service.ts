import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Recordatorio, TipoRecordatorio, CanalNotificacion } from './recordatorio.entity';
import { EmailProviderMock, WhatsAppProviderMock, SmsProviderMock } from './providers/notificacion.provider';

@Injectable()
export class RecordatoriosService {
  private readonly logger = new Logger(RecordatoriosService.name);

  constructor(
    @InjectRepository(Recordatorio) private readonly repo: Repository<Recordatorio>,
    private readonly emailProvider: EmailProviderMock,
    private readonly whatsappProvider: WhatsAppProviderMock,
    private readonly smsProvider: SmsProviderMock,
  ) {}

  async crear(data: Partial<Recordatorio>): Promise<Recordatorio> {
    return this.repo.save(this.repo.create(data));
  }

  async generarVencimientoAlquiler(alquilerId: string, destinatario: string, fechaVencimiento: Date, tenantId: string): Promise<void> {
    await this.crear({
      tipo: TipoRecordatorio.VENCIMIENTO_ALQUILER,
      canal: CanalNotificacion.EMAIL,
      destinatario,
      referenciaId: alquilerId,
      referenciaTipo: 'alquiler',
      asunto: 'Recordatorio: alquiler próximo a vencer',
      cuerpo: `Su alquiler vence el ${fechaVencimiento.toLocaleDateString('es-AR')}. Por favor coordine la devolución.`,
      tenantId,
    });
  }

  async generarDevolucionPendiente(alquilerId: string, destinatario: string, tenantId: string): Promise<void> {
    await this.crear({
      tipo: TipoRecordatorio.DEVOLUCION_PENDIENTE,
      canal: CanalNotificacion.WHATSAPP,
      destinatario,
      referenciaId: alquilerId,
      referenciaTipo: 'alquiler',
      asunto: 'Devolución pendiente',
      cuerpo: `Tiene equipos pendientes de devolución. Por favor contáctenos.`,
      tenantId,
    });
  }

  private getProvider(canal: CanalNotificacion) {
    if (canal === CanalNotificacion.WHATSAPP) return this.whatsappProvider;
    if (canal === CanalNotificacion.SMS) return this.smsProvider;
    return this.emailProvider;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async procesarPendientes(): Promise<void> {
    const pendientes = await this.repo.find({
      where: { enviado: false, fechaEnvio: IsNull() },
      take: 20,
    });
    if (!pendientes.length) return;
    this.logger.log(`Procesando ${pendientes.length} recordatorio(s) pendiente(s)`);
    for (const r of pendientes) {
      try {
        const provider = this.getProvider(r.canal);
        await provider.enviar({ destinatario: r.destinatario, asunto: r.asunto, cuerpo: r.cuerpo ?? '' });
        r.enviado = true;
        r.fechaEnvio = new Date();
      } catch (err) {
        r.error = String(err);
      }
      await this.repo.save(r);
    }
  }

  async findAll(tenantId: string): Promise<Recordatorio[]> {
    return this.repo.find({ where: { tenantId }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async probarEnvio(id: string, tenantId: string): Promise<{ ok: boolean }> {
    const r = await this.repo.findOne({ where: { id, tenantId } });
    if (!r) return { ok: false };
    const provider = this.getProvider(r.canal);
    const ok = await provider.enviar({ destinatario: r.destinatario, asunto: r.asunto, cuerpo: r.cuerpo ?? '' });
    return { ok };
  }
}
