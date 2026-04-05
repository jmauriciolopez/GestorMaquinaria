import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { ActivosModule } from './activos/activos.module';
import { CategoriasActivoModule } from './categorias-activo/categorias-activo.module';
import { ModelosActivoModule } from './modelos-activo/modelos-activo.module';
import { MovimientosActivoModule } from './movimientos-activo/movimientos-activo.module';
import { ClientesModule } from './clientes/clientes.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { ReservasModule } from './reservas/reservas.module';
import { AlquileresModule } from './alquileres/alquileres.module';
import { DevolucionesModule } from './devoluciones/devoluciones.module';
import { PenalidadesModule } from './penalidades/penalidades.module';
import { MantenimientosModule } from './mantenimientos/mantenimientos.module';
import { RecordatoriosModule } from './recordatorios/recordatorios.module';
import { PagosModule } from './pagos/pagos.module';
import { ReportsModule } from './reports/reports.module';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mercadopagoConfig from './config/mercadopago.config';
import notificacionesConfig from './config/notificaciones.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mercadopagoConfig, notificacionesConfig],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,    limit: 10   },
      { name: 'medium', ttl: 60000,   limit: 200  },
      { name: 'long',   ttl: 3600000, limit: 2000 },
    ]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    HealthModule,
    StorageModule,
    AuthModule,
    UsuariosModule,
    RolesModule,
    SucursalesModule,
    ActivosModule,
    CategoriasActivoModule,
    ModelosActivoModule,
    MovimientosActivoModule,
    ClientesModule,
    TarifasModule,
    ReservasModule,
    AlquileresModule,
    DevolucionesModule,
    PenalidadesModule,
    MantenimientosModule,
    RecordatoriosModule,
    PagosModule,
    ReportsModule,
    MercadoPagoModule,
    NotificacionesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
