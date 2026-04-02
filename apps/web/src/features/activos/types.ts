export enum EstadoActivo {
  DISPONIBLE        = 'disponible',
  RESERVADO         = 'reservado',
  ALQUILADO         = 'alquilado',
  EN_TRANSITO       = 'en_transito',
  EN_MANTENIMIENTO  = 'en_mantenimiento',
  FUERA_DE_SERVICIO = 'fuera_de_servicio',
  PERDIDO           = 'perdido',
}

export enum TipoMovimiento {
  CHECK_OUT             = 'check_out',
  CHECK_IN              = 'check_in',
  TRASLADO              = 'traslado',
  ENTRADA_MANTENIMIENTO = 'entrada_mantenimiento',
  SALIDA_MANTENIMIENTO  = 'salida_mantenimiento',
  BAJA                  = 'baja',
  AJUSTE                = 'ajuste',
}

export interface MovimientoActivo {
  id: string;
  activoId: string;
  tipo: TipoMovimiento;
  estadoAnterior?: EstadoActivo;
  estadoNuevo: EstadoActivo;
  ubicacionOrigen?: string;
  ubicacionDestino?: string;
  observaciones?: string;
  createdAt: string;
  usuario?: { id: string; nombre: string };
}

export interface Activo {
  id: string;
  tenantId: string;
  sucursalId: string;
  modeloId: string;
  codigoInterno: string;
  numeroSerie?: string | null;
  estado: EstadoActivo;
  ubicacionActual?: string | null;
  annoFabricacion?: number | null;
  fechaAdquisicion?: string | null;
  valorAdquisicion?: number | null;
  notas?: string | null;
  modelo?: {
    id: string;
    nombre: string;
    marca?: string;
    especificaciones?: Record<string, string>;
    categoria?: { id: string; nombre: string };
  };
  sucursal?: { id: string; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetStats {
  disponible: number;
  alquiler: number;
  mantenimiento: number;
  fuera_servicio: number;
  reservado: number;
  total: number;
}
