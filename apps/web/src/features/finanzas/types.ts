export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  TARJETA = 'tarjeta',
  CHEQUE = 'cheque',
  OTRO = 'otro',
}

export interface Pago {
  id: string;
  alquilerId: string;
  monto: number;
  fecha: string;
  metodoPago: MetodoPago;
  referencia?: string;
  notas?: string;
  usuario?: {
    nombre: string;
  };
}

export interface CreatePagoDto {
  alquilerId: string;
  monto: number;
  fecha: string;
  metodoPago: MetodoPago;
  referencia?: string;
  notas?: string;
}

export interface FinanceStats {
  totalCobrado: number;
}
