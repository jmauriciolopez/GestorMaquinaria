export enum EstadoActivo {
  DISPONIBLE        = 'disponible',
  RESERVADO         = 'reservado',
  ALQUILADO         = 'alquilado',
  EN_TRANSITO       = 'en_transito',
  EN_MANTENIMIENTO  = 'en_mantenimiento',
  FUERA_DE_SERVICIO = 'fuera_de_servicio',
  PERDIDO           = 'perdido',
}

export interface Activo {
  id: string;
  tenantId: string;
  sucursalId: string;
  modeloId: string;
  codigoInterno: string;
  numeroSerie?: string;
  estado: EstadoActivo;
  ubicacionActual?: string;
  annoFabricacion?: number;
  fechaAdquisicion?: string;
  valorAdquisicion?: number;
  notas?: string;
  modelo?: {
    id: string;
    nombre: string;
    marca?: string;
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
