import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alquiler, AlquilerItem } from './alquiler.entity';
import { EntregaActivo } from './entrega-activo.entity';
import { DevolucionActivo } from './devolucion-activo.entity';
import { AlquileresService } from './alquileres.service';
import { AlquileresController } from './alquileres.controller';
import { ActivosModule } from '../activos/activos.module';
import { MovimientosActivoModule } from '../movimientos-activo/movimientos-activo.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alquiler, AlquilerItem, EntregaActivo, DevolucionActivo]),
    ActivosModule,
    MovimientosActivoModule,
    NotificacionesModule,
  ],
  controllers: [AlquileresController],
  providers: [AlquileresService],
  exports: [AlquileresService],
})
export class AlquileresModule {}
