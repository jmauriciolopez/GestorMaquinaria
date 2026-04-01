import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursal } from './sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal])],
  exports: [TypeOrmModule],
})
export class SucursalesModule {}
