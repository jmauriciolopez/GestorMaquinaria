import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoService } from './mercadopago.service';
import { MercadoPagoController } from './mercadopago.controller';
import { Pago } from '../pagos/pago.entity';
import { Alquiler } from '../alquileres/alquiler.entity';
import { AlquilerItem } from '../alquileres/alquiler.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Alquiler, AlquilerItem]),
    NotificacionesModule,
  ],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
