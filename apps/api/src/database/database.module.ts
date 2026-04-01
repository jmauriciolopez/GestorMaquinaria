import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('app.nodeEnv') === 'production';
        return {
          type: 'postgres',
          url: config.get<string>('database.url'),
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),
          entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
          migrationsTableName: 'typeorm_migrations',
          // En producción: synchronize=false, migrationsRun=true automático
          // En desarrollo: synchronize=true para iterar rápido
          synchronize: !isProduction,
          migrationsRun: isProduction,
          logging: config.get<boolean>('database.logging'),
          autoLoadEntities: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
