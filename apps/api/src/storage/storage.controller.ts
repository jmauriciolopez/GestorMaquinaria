import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { StorageService } from './storage.service';
import { GetUsuario, UsuarioActivo } from '../common/decorators/get-usuario.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

class ArchivoDto {
  @IsString() base64: string;
  @IsString() mimeType: string;
}

class UploadDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ArchivoDto)
  archivos: ArchivoDto[];

  @IsOptional() @IsString()
  carpeta?: string;
}

@Controller('storage')
@UseGuards(RolesGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  async upload(@Body() dto: UploadDto, @GetUsuario() u: UsuarioActivo) {
    const carpeta = dto.carpeta ?? `tenant-${u.tenantId}`;
    const urls    = await this.storageService.uploadMultiple(dto.archivos, carpeta);
    return { urls };
  }
}
