import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DollarSign, Calendar, CreditCard, FileText, Send } from 'lucide-react';
import { useRegistrarPago } from '../hooks/usePagosData';
import { MetodoPago } from '../types';
import './PaymentForm.css';

const schema = z.object({
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'Fecha requerida'),
  metodoPago: z.nativeEnum(MetodoPago),
  referencia: z.string().optional(),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  alquilerId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<Props> = ({ alquilerId, onSuccess, onCancel }) => {
  const mutation = useRegistrarPago();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      monto: 0,
      fecha: new Date().toISOString().split('T')[0],
      metodoPago: MetodoPago.EFECTIVO,
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({ ...data, alquilerId }, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    });
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>Monto a Cobrar (USD)</label>
        <div className="input-with-icon">
          <DollarSign size={18} />
          <input 
            type="number" 
            step="0.01" 
            {...register('monto', { valueAsNumber: true })} 
            placeholder="0.00"
          />
        </div>
        {errors.monto && <span className="error-text">{errors.monto.message}</span>}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Fecha de Cobro</label>
          <div className="input-with-icon">
            <Calendar size={18} />
            <input type="date" {...register('fecha')} />
          </div>
          {errors.fecha && <span className="error-text">{errors.fecha.message}</span>}
        </div>

        <div className="form-group">
          <label>Método de Pago</label>
          <div className="input-with-icon">
            <CreditCard size={18} />
            <select {...register('metodoPago')}>
              <option value={MetodoPago.EFECTIVO}>Efectivo</option>
              <option value={MetodoPago.TRANSFERENCIA}>Transferencia</option>
              <option value={MetodoPago.TARJETA}>Tarjeta Débito/Crédito</option>
              <option value={MetodoPago.CHEQUE}>Cheque</option>
              <option value={MetodoPago.OTRO}>Otro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Nro. de Comprobante / Referencia</label>
        <div className="input-with-icon">
          <FileText size={18} />
          <input type="text" {...register('referencia')} placeholder="Ej: Transf. #123456" />
        </div>
      </div>

      <div className="form-group">
        <label>Notas adicionales</label>
        <textarea {...register('notas')} rows={3} placeholder="Ingrese comentarios relevantes..." />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          <Send size={18} />
          {mutation.isPending ? 'Registrando...' : 'Registrar Cobro'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
