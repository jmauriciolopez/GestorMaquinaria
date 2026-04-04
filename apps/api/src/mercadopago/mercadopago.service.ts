import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from '../pagos/pago.entity';
import { Alquiler } from '../alquileres/alquiler.entity';
import { MetodoPago } from '../pagos/metodo-pago.enum';

export interface CrearPreferenciaDto {
  alquilerId: string;
  monto: number;
  descripcion: string;
  tenantId: string;
  usuarioId?: string;
  externalReference?: string;
}

export interface PreferenciaResult {
  preferenceId: string;
  initPoint: string;       // URL producción
  sandboxInitPoint: string; // URL sandbox (testing)
  pagoId: string;          // ID del pago en nuestra DB
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Pago)     private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Alquiler) private readonly alquilerRepo: Repository<Alquiler>,
  ) {
    this.client = new MercadoPagoConfig({
      accessToken: this.config.get<string>('mercadopago.accessToken') ?? '',
      options: { timeout: 5000 },
    });
  }

  async crearPreferencia(dto: CrearPreferenciaDto): Promise<PreferenciaResult> {
    const alquiler = await this.alquilerRepo.findOne({
      where: { id: dto.alquilerId, tenantId: dto.tenantId },
      relations: ['cliente'],
    });
    if (!alquiler) throw new BadRequestException('Alquiler no encontrado');

    const appUrl      = this.config.get<string>('mercadopago.appUrl');
    const webhookUrl  = this.config.get<string>('mercadopago.webhookUrl');
    const externalRef = dto.externalReference ?? `alquiler-${dto.alquilerId}`;

    // Crear registro de pago en estado pendiente ANTES de ir a MP
    const pago = await this.pagoRepo.save(
      this.pagoRepo.create({
        alquilerId:       dto.alquilerId,
        tenantId:         dto.tenantId,
        usuarioId:        dto.usuarioId,
        monto:            dto.monto,
        metodoPago:       MetodoPago.MERCADOPAGO,
        mpStatus:         'pending',
        mpExternalReference: externalRef,
        notas:            'Pago iniciado vía MercadoPago',
      }),
    );

    const preferenceApi = new Preference(this.client);
    const response = await preferenceApi.create({
      body: {
        external_reference: externalRef,
        items: [{
          id:          dto.alquilerId,
          title:       dto.descripcion,
          quantity:    1,
          unit_price:  Number(dto.monto),
          currency_id: 'ARS',
        }],
        payer: alquiler.cliente ? {
          name:  alquiler.cliente.nombre,
          email: alquiler.cliente.email ?? undefined,
        } : undefined,
        back_urls: {
          success: `${appUrl}/alquileres/${dto.alquilerId}?mp=success`,
          failure: `${appUrl}/alquileres/${dto.alquilerId}?mp=failure`,
          pending: `${appUrl}/alquileres/${dto.alquilerId}?mp=pending`,
        },
        auto_return:         'approved',
        notification_url:    webhookUrl,
        statement_descriptor: 'MAQUINARIA ALQUILER',
        metadata: {
          pago_id:    pago.id,
          alquiler_id: dto.alquilerId,
          tenant_id:   dto.tenantId,
        },
      },
    });

    // Guardar preference_id en el pago
    await this.pagoRepo.update(pago.id, { mpPreferenceId: response.id });

    this.logger.log(`Preferencia MP creada: ${response.id} para alquiler ${dto.alquilerId}`);

    return {
      preferenceId:      response.id ?? '',
      initPoint:         response.init_point ?? '',
      sandboxInitPoint:  response.sandbox_init_point ?? '',
      pagoId:            pago.id,
    };
  }

  async procesarWebhook(body: Record<string, unknown>): Promise<void> {
    // MP envía: { type: 'payment', data: { id: '12345' } }
    if (body['type'] !== 'payment') return;

    const paymentId = String((body['data'] as any)?.id ?? '');
    if (!paymentId) return;

    try {
      const paymentApi = new Payment(this.client);
      const payment    = await paymentApi.get({ id: paymentId });

      const externalRef = payment.external_reference ?? '';
      const status      = payment.status ?? '';
      const monto       = payment.transaction_amount ?? 0;

      // Buscar pago en nuestra DB por external_reference
      const pago = await this.pagoRepo.findOne({
        where: { mpExternalReference: externalRef },
      });

      if (!pago) {
        this.logger.warn(`Pago no encontrado para referencia: ${externalRef}`);
        return;
      }

      // Actualizar estado del pago
      pago.mpPaymentId = paymentId;
      pago.mpStatus    = status;
      pago.referencia  = paymentId;

      if (status === 'approved') {
        pago.fecha = new Date();
        // Acreditar en el alquiler
        const alquiler = await this.alquilerRepo.findOne({ where: { id: pago.alquilerId } });
        if (alquiler) {
          alquiler.totalPagado = Number(alquiler.totalPagado) + Number(monto);
          await this.alquilerRepo.save(alquiler);
          this.logger.log(`Pago aprobado: $${monto} para alquiler ${pago.alquilerId}`);
        }
      }

      await this.pagoRepo.save(pago);
    } catch (err) {
      this.logger.error(`Error procesando webhook MP: ${err}`);
    }
  }
}
