export enum MetodoPago {
  EFECTIVO      = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  TARJETA       = 'tarjeta',
  CHEQUE        = 'cheque',
  MERCADOPAGO   = 'mercadopago',
  OTRO          = 'otro',
}

export interface Pago {
  id: string;
  alquilerId: string;
  monto: number;
  fecha: string;
  metodoPago: MetodoPago;
  referencia?: string;
  notas?: string;
  mpStatus?: string;
  usuario?: { nombre: string };
  alquiler?: { id: string; cliente?: { nombre: string } };
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
  totalTransacciones: number;
  ticketPromedio: number;
}
