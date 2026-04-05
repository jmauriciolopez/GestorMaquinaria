import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Usuario } from '../usuarios/usuario.entity';
import { Alquiler } from '../alquileres/alquiler.entity';
import { EstadoAlquiler } from '../alquileres/estado-alquiler.enum';

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private readonly modo: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Usuario)  private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Alquiler) private readonly alquilerRepo: Repository<Alquiler>,
  ) {
    this.modo = this.config.get<string>('notificaciones.modo') ?? 'mock';
  }

  // ─── Registro de token ──────────────────────────────────────────────────────

  async registrarToken(usuarioId: string, token: string): Promise<void> {
    await this.usuarioRepo.update(usuarioId, { expoPushToken: token });
    this.logger.log(`Token registrado para usuario ${usuarioId}`);
  }

  // ─── Envío individual ───────────────────────────────────────────────────────

  async enviar(msg: PushMessage): Promise<void> {
    if (this.modo === 'mock') {
      this.logger.debug(`[MOCK] Push → ${msg.to} | ${msg.title}: ${msg.body}`);
      return;
    }
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(msg),
      });
      const json = await res.json() as { data?: { status: string; message?: string } };
      if (json.data?.status === 'error') {
        this.logger.warn(`Error enviando push: ${json.data.message}`);
      }
    } catch (err) {
      this.logger.error(`Fallo push a ${msg.to}: ${err}`);
    }
  }

  async enviarAUsuario(usuarioId: string, title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario?.expoPushToken) return;
    await this.enviar({ to: usuario.expoPushToken, title, body, data });
  }

  // ─── Helpers de negocio ─────────────────────────────────────────────────────

  async notificarNuevoAlquiler(alquilerId: string, usuarioId: string): Promise<void> {
    await this.enviarAUsuario(
      usuarioId,
      '📋 Nuevo alquiler creado',
      `Se generó el alquiler #${alquilerId.slice(-6).toUpperCase()}`,
      { screen: 'AlquilerDetail', alquilerId },
    );
  }

  async notificarCheckOut(alquilerId: string, usuarioId: string): Promise<void> {
    await this.enviarAUsuario(
      usuarioId,
      '🚀 Entrega registrada',
      `Check-out del alquiler #${alquilerId.slice(-6).toUpperCase()} completado`,
      { screen: 'AlquilerDetail', alquilerId },
    );
  }

  async notificarCheckIn(alquilerId: string, usuarioId: string): Promise<void> {
    await this.enviarAUsuario(
      usuarioId,
      '✅ Devolución registrada',
      `Check-in del alquiler #${alquilerId.slice(-6).toUpperCase()} completado`,
      { screen: 'AlquilerDetail', alquilerId },
    );
  }

  async notificarPagoConfirmado(alquilerId: string, monto: number, usuarioId: string): Promise<void> {
    await this.enviarAUsuario(
      usuarioId,
      '💰 Pago confirmado',
      `Se acreditó $${monto.toLocaleString('es-AR')} en el alquiler #${alquilerId.slice(-6).toUpperCase()}`,
      { screen: 'AlquilerDetail', alquilerId },
    );
  }

  // ─── Cron: vencimientos próximos ────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async notificarVencimientosProximos(): Promise<void> {
    this.logger.log('Cron vencimientos: buscando alquileres próximos a vencer...');
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(23, 59, 59, 999);

    const alquileres = await this.alquilerRepo.find({
      where: {
        estado: EstadoAlquiler.ENTREGADO,
        fechaFinPrevista: LessThan(manana),
      },
      relations: ['usuario'],
    });

    for (const a of alquileres) {
      if (!a.usuario?.expoPushToken) continue;
      await this.enviar({
        to: a.usuario.expoPushToken,
        title: '⏰ Alquiler por vencer',
        body: `El alquiler #${a.id.slice(-6).toUpperCase()} vence mañana`,
        data: { screen: 'AlquilerDetail', alquilerId: a.id },
      });
    }

    this.logger.log(`Vencimientos notificados: ${alquileres.length}`);
  }
}
