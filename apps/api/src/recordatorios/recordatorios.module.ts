import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recordatorio } from './recordatorio.entity';
import { RecordatoriosService } from './recordatorios.service';
import { RecordatoriosController } from './recordatorios.controller';
import { EmailProviderMock, WhatsAppProviderMock, SmsProviderMock } from './providers/notificacion.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Recordatorio])],
  controllers: [RecordatoriosController],
  providers: [RecordatoriosService, EmailProviderMock, WhatsAppProviderMock, SmsProviderMock],
  exports: [RecordatoriosService],
})
export class RecordatoriosModule {}
