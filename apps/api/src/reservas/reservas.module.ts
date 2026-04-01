import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva, ReservaItem } from './reserva.entity';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { ActivosModule } from '../activos/activos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, ReservaItem]), ActivosModule],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
