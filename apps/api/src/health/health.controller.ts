import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: 'ok' | 'error';
    memory: {
      status: 'ok' | 'warning';
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
    };
  };
}

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Public()
  @Get()
  async check(): Promise<HealthStatus> {
    const mem = process.memoryUsage();
    const toMb = (bytes: number) => Math.round(bytes / 1024 / 1024);

    let dbStatus: 'ok' | 'error' = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      dbStatus = 'error';
    }

    const heapUsedMb = toMb(mem.heapUsed);
    const heapTotalMb = toMb(mem.heapTotal);

    return {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version ?? '1.0.0',
      checks: {
        database: dbStatus,
        memory: {
          status: heapUsedMb / heapTotalMb > 0.9 ? 'warning' : 'ok',
          heapUsedMb,
          heapTotalMb,
          rssMb: toMb(mem.rss),
        },
      },
    };
  }

  @Public()
  @Get('ping')
  ping(): { pong: boolean; ts: string } {
    return { pong: true, ts: new Date().toISOString() };
  }
}
