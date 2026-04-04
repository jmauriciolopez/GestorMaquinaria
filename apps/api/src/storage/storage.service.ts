import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface UploadResult {
  url: string;
  key: string;
  bucket?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly modo: string;
  private s3: any;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly config: ConfigService) {
    this.modo   = config.get<string>('notificaciones.modo') ?? 'mock';
    this.bucket = config.get<string>('notificaciones.awsS3Bucket') ?? '';
    this.region = config.get<string>('notificaciones.awsRegion') ?? 'sa-east-1';

    if (this.modo === 'real' && this.bucket) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AWS = require('aws-sdk');
      this.s3 = new AWS.S3({
        accessKeyId:     config.get<string>('notificaciones.awsAccessKeyId'),
        secretAccessKey: config.get<string>('notificaciones.awsSecretAccessKey'),
        region:          this.region,
      });
    }
  }

  async uploadBase64(
    base64: string,
    mimeType: string,
    carpeta: string,
  ): Promise<UploadResult> {
    const ext    = mimeType.split('/')[1] ?? 'jpg';
    const key    = `${carpeta}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(base64.replace(/^data:[^;]+;base64,/, ''), 'base64');

    if (this.modo !== 'real' || !this.s3) {
      const dir      = path.join(process.cwd(), 'uploads', carpeta);
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, path.basename(key));
      fs.writeFileSync(filePath, buffer);
      const url = `/uploads/${key}`;
      this.logger.log(`[STORAGE MOCK] Guardado: ${filePath}`);
      return { url, key };
    }

    const result = await this.s3.upload({
      Bucket:      this.bucket,
      Key:         key,
      Body:        buffer,
      ContentType: mimeType,
      ACL:         'public-read',
    }).promise();

    this.logger.log(`[S3] Subido: ${result.Location}`);
    return { url: result.Location, key, bucket: this.bucket };
  }

  async uploadMultiple(
    archivos: { base64: string; mimeType: string }[],
    carpeta: string,
  ): Promise<string[]> {
    const resultados = await Promise.all(
      archivos.map((a) => this.uploadBase64(a.base64, a.mimeType, carpeta)),
    );
    return resultados.map((r) => r.url);
  }

  async eliminar(key: string): Promise<void> {
    if (this.modo !== 'real' || !this.s3) return;
    await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
  }
}
