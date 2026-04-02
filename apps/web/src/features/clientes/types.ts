export interface Cliente {
  id: string;
  tenantId: string;
  nombre: string;
  razonSocial?: string;
  documento?: string;
  tipoDocumento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientePayload {
  nombre: string;
  razonSocial?: string;
  documento?: string;
  tipoDocumento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  activo?: boolean;
}
