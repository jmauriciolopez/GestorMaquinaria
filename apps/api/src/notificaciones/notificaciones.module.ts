import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { Usuario } from '../usuarios/usuario.entity';
import { Alquiler } from '../alquileres/alquiler.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Alquiler])],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
