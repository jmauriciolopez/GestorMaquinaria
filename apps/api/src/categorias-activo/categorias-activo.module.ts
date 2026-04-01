import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaActivo } from './categoria-activo.entity';
import { CategoriasActivoService } from './categorias-activo.service';
import { CategoriasActivoController } from './categorias-activo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaActivo])],
  controllers: [CategoriasActivoController],
  providers: [CategoriasActivoService],
  exports: [CategoriasActivoService],
})
export class CategoriasActivoModule {}
