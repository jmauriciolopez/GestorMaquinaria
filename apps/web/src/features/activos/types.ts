export enum EstadoActivo {
  DISPONIBLE = 'disponible',
  ALQUILADO = 'alquiler',
  EN_MANTENIMIENTO = 'mantenimiento',
  FUERA_DE_SERVICIO = 'fuera_servicio',
  RESERVADO = 'reservado',
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Modelo {
  id: string;
  nombre: string;
  categoria: Categoria;
}

export interface Sucursal {
  id: string;
  nombre: string;
}

export interface Activo {
  id: string;
  codigoInterno: string;
  numeroSerie: string;
  nombre: string;
  descripcion?: string;
  estado: EstadoActivo;
  ultimaUbicacion?: string;
  modelo: Modelo;
  sucursal: Sucursal;
  createdAt: string;
  updatedAt: string;
}

export interface Movimiento {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  usuarioId: string;
}

export interface AssetStats {
  [key: string]: number;
}
