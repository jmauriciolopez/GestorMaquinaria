import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevolucionActivo, InspeccionActivo, DanoActivo } from './devolucion.entity';
import { DevolucionesService } from './devoluciones.service';
import { DevolucionesController } from './devoluciones.controller';
import { AlquileresModule } from '../alquileres/alquileres.module';
import { ActivosModule } from '../activos/activos.module';
import { MovimientosActivoModule } from '../movimientos-activo/movimientos-activo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DevolucionActivo, InspeccionActivo, DanoActivo]),
    AlquileresModule,
    ActivosModule,
    MovimientosActivoModule,
  ],
  controllers: [DevolucionesController],
  providers: [DevolucionesService],
  exports: [DevolucionesService],
})
export class DevolucionesModule {}
