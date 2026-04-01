import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './pago.entity';
import { Alquiler } from '../alquileres/alquiler.entity';
import { CreatePagoDto } from './dto/pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago) private readonly repo: Repository<Pago>,
    @InjectRepository(Alquiler) private readonly alquilerRepo: Repository<Alquiler>,
  ) {}

  async registrar(dto: CreatePagoDto, usuarioId: string, tenantId: string): Promise<Pago> {
    const alquiler = await this.alquilerRepo.findOne({ where: { id: dto.alquilerId, tenantId } });
    if (!alquiler) throw new NotFoundException('Alquiler no encontrado');

    const pago = await this.repo.save(
      this.repo.create({ 
        ...dto, 
        usuarioId, 
        tenantId,
        fecha: new Date(dto.fecha)
      }),
    );

    // Actualizar el total pagado en el alquiler
    alquiler.totalPagado = Number(alquiler.totalPagado) + Number(dto.monto);
    await this.alquilerRepo.save(alquiler);

    return this.findOne(pago.id, tenantId);
  }

  async findByAlquiler(alquilerId: string, tenantId: string): Promise<Pago[]> {
    return this.repo.find({
      where: { alquilerId, tenantId },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Pago> {
    const p = await this.repo.findOne({ where: { id, tenantId }, relations: ['usuario'] });
    if (!p) throw new NotFoundException('Pago no encontrado');
    return p;
  }

  async dashboardStats(tenantId: string) {
    const totalCobrado = await this.repo.sum('monto', { tenantId });
    return {
      totalCobrado: Number(totalCobrado || 0),
    };
  }
}
