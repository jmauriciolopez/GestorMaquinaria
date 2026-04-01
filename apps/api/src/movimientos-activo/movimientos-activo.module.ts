import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoActivo } from './movimiento-activo.entity';
import { MovimientosActivoService } from './movimientos-activo.service';
import { MovimientosActivoController } from './movimientos-activo.controller';
import { ActivosModule } from '../activos/activos.module';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoActivo]), ActivosModule],
  controllers: [MovimientosActivoController],
  providers: [MovimientosActivoService],
  exports: [MovimientosActivoService],
})
export class MovimientosActivoModule {}
