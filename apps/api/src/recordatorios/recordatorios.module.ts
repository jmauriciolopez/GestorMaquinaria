import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recordatorio } from './recordatorio.entity';
import { RecordatoriosService } from './recordatorios.service';
import { RecordatoriosController } from './recordatorios.controller';
import { EmailProvider, WhatsAppProvider, SmsProviderMock } from './providers/notificacion.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Recordatorio])],
  controllers: [RecordatoriosController],
  providers: [RecordatoriosService, EmailProvider, WhatsAppProvider, SmsProviderMock],
  exports: [RecordatoriosService, EmailProvider, WhatsAppProvider],
})
export class RecordatoriosModule {}
