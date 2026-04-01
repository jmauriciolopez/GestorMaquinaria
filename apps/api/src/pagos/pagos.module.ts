import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { Pago } from './pago.entity';
import { Alquiler } from '../alquileres/alquiler.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Alquiler]),
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
