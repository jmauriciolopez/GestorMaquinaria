import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Penalidad } from './penalidad.entity';
import { PenalidadesService } from './penalidades.service';
import { PenalidadesController } from './penalidades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Penalidad])],
  controllers: [PenalidadesController],
  providers: [PenalidadesService],
  exports: [PenalidadesService],
})
export class PenalidadesModule {}
