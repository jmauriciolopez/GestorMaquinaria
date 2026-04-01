import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mantenimiento, EstadoMantenimiento, OrdenTrabajo } from './mantenimiento.entity';
import { CreateMantenimientoDto, IniciarMantenimientoDto, CerrarMantenimientoDto, CreateOrdenTrabajoDto } from './dto/mantenimiento.dto';
import { ActivosService } from '../activos/activos.service';
import { MovimientosActivoService } from '../movimientos-activo/movimientos-activo.service';
import { EstadoActivo } from '../activos/estado-activo.enum';
import { TipoMovimiento } from '../movimientos-activo/tipo-movimiento.enum';

@Injectable()
export class MantenimientosService {
  constructor(
    @InjectRepository(Mantenimiento) private readonly repo: Repository<Mantenimiento>,
    @InjectRepository(OrdenTrabajo) private readonly otRepo: Repository<OrdenTrabajo>,
    private readonly activosService: ActivosService,
    private readonly movimientosService: MovimientosActivoService,
  ) {}

  async create(dto: CreateMantenimientoDto, usuarioId: string, tenantId: string): Promise<Mantenimiento> {
    const activo = await this.activosService.findOne(dto.activoId, tenantId);
    if (activo.estado === EstadoActivo.ALQUILADO && !dto.ignorarAlquiler) {
      throw new BadRequestException('El activo está alquilado. No se puede programar mantenimiento sin excepción administrada.');
    }
    const { ignorarAlquiler, ...data } = dto;
    return this.repo.save(this.repo.create({ ...data, usuarioId, tenantId }));
  }

  async iniciar(id: string, dto: IniciarMantenimientoDto, usuarioId: string, tenantId: string): Promise<Mantenimiento> {
    const m = await this.findOne(id, tenantId);
    if (m.estado !== EstadoMantenimiento.PROGRAMADO) throw new BadRequestException('El mantenimiento ya fue iniciado o cerrado');
    
    m.estado = EstadoMantenimiento.EN_CURSO;
    m.fechaInicio = new Date();
    if (dto.diagnostico) m.diagnostico = dto.diagnostico;
    
    await this.movimientosService.registrar(
      { 
        activoId: m.activoId, 
        tipo: TipoMovimiento.ENTRADA_MANTENIMIENTO, 
        estadoNuevo: EstadoActivo.EN_MANTENIMIENTO, 
        mantenimientoId: id 
      },
      usuarioId, tenantId,
    );
    
    return this.repo.save(m);
  }

  async registrarOrdenTrabajo(mantenimientoId: string, dto: CreateOrdenTrabajoDto, usuarioId: string, tenantId: string): Promise<OrdenTrabajo> {
    const m = await this.findOne(mantenimientoId, tenantId);
    const ot = this.otRepo.create({
      ...dto,
      mantenimientoId: m.id,
      usuarioId,
    });
    return this.otRepo.save(ot);
  }

  async cerrar(id: string, dto: CerrarMantenimientoDto, usuarioId: string, tenantId: string): Promise<Mantenimiento> {
    const m = await this.findOne(id, tenantId);
    if (m.estado !== EstadoMantenimiento.EN_CURSO) throw new BadRequestException('El mantenimiento no está en curso');
    
    m.estado = EstadoMantenimiento.COMPLETADO;
    m.fechaCierre = new Date();
    m.tareasRealizadas = dto.tareasRealizadas;
    m.repuestosUsados = dto.repuestosUsados;
    m.costoTotal = dto.costoTotal;
    
    const estadoFinal = (dto.estadoFinalActivo as EstadoActivo) ?? EstadoActivo.DISPONIBLE;
    
    await this.movimientosService.registrar(
      { 
        activoId: m.activoId, 
        tipo: TipoMovimiento.SALIDA_MANTENIMIENTO, 
        estadoNuevo: estadoFinal, 
        mantenimientoId: id 
      },
      usuarioId, tenantId,
    );
    
    return this.repo.save(m);
  }

  async findAll(tenantId: string): Promise<Mantenimiento[]> {
    return this.repo.find({ 
      where: { tenantId }, 
      order: { createdAt: 'DESC' },
      relations: ['ordenesTrabajo']
    });
  }

  async findOne(id: string, tenantId: string): Promise<Mantenimiento> {
    const m = await this.repo.findOne({ 
      where: { id, tenantId },
      relations: ['ordenesTrabajo'] 
    });
    if (!m) throw new NotFoundException('Mantenimiento no encontrado');
    return m;
  }

  async findByActivo(activoId: string): Promise<Mantenimiento[]> {
    return this.repo.find({ 
      where: { activoId }, 
      order: { createdAt: 'DESC' },
      relations: ['ordenesTrabajo']
    });
  }
}
