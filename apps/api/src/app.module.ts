import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { ActivosModule } from './activos/activos.module';
import { CategoriasActivoModule } from './categorias-activo/categorias-activo.module';
import { ModelosActivoModule } from './modelos-activo/modelos-activo.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsuariosModule,
    RolesModule,
    SucursalesModule,
    ActivosModule,
    CategoriasActivoModule,
    ModelosActivoModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
