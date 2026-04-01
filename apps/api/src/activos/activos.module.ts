import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activo } from './activo.entity';
import { ActivosService } from './activos.service';
import { ActivosController } from './activos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Activo])],
  controllers: [ActivosController],
  providers: [ActivosService],
  exports: [ActivosService],
})
export class ActivosModule {}
