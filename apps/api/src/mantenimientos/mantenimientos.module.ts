import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mantenimiento, OrdenTrabajo } from './mantenimiento.entity';
import { MantenimientosService } from './mantenimientos.service';
import { MantenimientosController } from './mantenimientos.controller';
import { ActivosModule } from '../activos/activos.module';
import { MovimientosActivoModule } from '../movimientos-activo/movimientos-activo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mantenimiento, OrdenTrabajo]),
    ActivosModule,
    MovimientosActivoModule,
  ],
  controllers: [MantenimientosController],
  providers: [MantenimientosService],
  exports: [MantenimientosService],
})
export class MantenimientosModule {}
