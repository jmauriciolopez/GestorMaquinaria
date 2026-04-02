
export enum EstadoAlquiler {
  BORRADOR         = 'borrador',
  CONFIRMADO       = 'confirmado',
  ENTREGADO        = 'entregado',
  DEVUELTO_PARCIAL = 'devuelto_parcial',
  DEVUELTO         = 'devuelto',
  CANCELADO        = 'cancelado',
  FINALIZADO       = 'finalizado',
}

export interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tenantId: string;
}

export interface AlquilerItem {
  id: string;
  alquilerId: string;
  activoId: string;
  activo?: {
    id: string;
    nombre: string;
    codigoInterno: string;
    estado: string;
  };
  tarifaId?: string;
  precioUnitario: number;
  subtotal: number;
}

export interface Alquiler {
  id: string;
  tenantId: string;
  sucursalId: string;
  clienteId: string;
  cliente: Cliente;
  usuarioId: string;
  usuario?: { nombre: string };
  reservaId?: string;
  estado: EstadoAlquiler;
  fechaInicio: string;
  fechaFinPrevista: string;
  fechaFinReal?: string;
  subtotal: number;
  totalPenalidades: number;
  totalPagado: number;
  notas?: string;
  items: AlquilerItem[];
  createdAt: string;
}

export interface EntregaActivo {
  id: string;
  alquilerId: string;
  activoId: string;
  horometroInicial: number;
  combustibleInicial: number;
  observaciones?: string;
  fechaEntrega: string;
}

export interface DevolucionActivo {
  id: string;
  alquilerId: string;
  activoId: string;
  horometroFinal: number;
  combustibleFinal: number;
  observaciones?: string;
  fechaDevolucion: string;
}

export interface Penalidad {
  id: string;
  alquilerId: string;
  activoId?: string;
  tipo: string;
  montoOriginal: number;
  montoFinal: number;
  motivo: string;
  observaciones?: string;
  estado: string;
  usuarioOverrideId?: string;
}
