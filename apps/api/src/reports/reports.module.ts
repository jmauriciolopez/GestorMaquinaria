import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Alquiler } from '../alquileres/alquiler.entity';
import { Pago } from '../pagos/pago.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alquiler, Pago]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
