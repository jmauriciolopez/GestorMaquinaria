import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeloActivo } from './modelo-activo.entity';
import { ModelosActivoService } from './modelos-activo.service';
import { ModelosActivoController } from './modelos-activo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ModeloActivo])],
  controllers: [ModelosActivoController],
  providers: [ModelosActivoService],
  exports: [ModelosActivoService],
})
export class ModelosActivoModule {}
