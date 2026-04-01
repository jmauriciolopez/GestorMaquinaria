import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Package,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { useClientes, useAlquileres } from '../hooks/useAlquileresData';
import { useActivos } from '../../activos/hooks/useActivosData';
import api from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import './AlquilerForm.css';

const itemSchema = z.object({
  activoId: z.string().uuid('Seleccione un activo'),
  precioUnitario: z.number().min(0, 'Precio inválido'),
});

const schema = z.object({
  clienteId: z.string().uuid('Seleccione un cliente'),
  sucursalId: z.string().uuid('Seleccione sucursal'),
  fechaInicio: z.string().min(1, 'Fecha inicio requerida'),
  fechaFinPrevista: z.string().min(1, 'Fecha fin requerida'),
  notas: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Debe agregar al menos un equipo'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

const AlquilerForm: React.FC<Props> = ({ onCancel, onSuccess }) => {
  const queryClient = useQueryClient();
  const { data: clientes } = useClientes();
  const { data: activosResult } = useActivos({ estado: 'DISPONIBLE' });
  const activos = activosResult?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: result } = await api.post('/alquileres', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alquileres'] });
      onSuccess();
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      items: [{ activoId: '', precioUnitario: 0 }],
      fechaInicio: new Date().toISOString().split('T')[0],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const total = items.reduce((acc, i) => acc + (Number(i.precioUnitario) || 0), 0);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <form className="alquiler-form" onSubmit={handleSubmit(onSubmit)}>
      <section className="form-section">
        <div className="section-title">
          <User size={18} />
          <h3>Información del Cliente</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Cliente</label>
            <select {...register('clienteId')}>
              <option value="">Seleccione un cliente...</option>
              {clientes?.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>
              ))}
            </select>
            {errors.clienteId && <span className="error-text">{errors.clienteId.message}</span>}
          </div>

          <div className="form-group">
            <label>Sucursal de Despacho</label>
            <select {...register('sucursalId')}>
              <option value="">Seleccione sucursal...</option>
              {/* TODO: Fetch sucursales properly, for now using a placeholder or common ID */}
              <option value="00000000-0000-0000-0000-000000000001">Taller Central - Córdoba</option>
            </select>
            {errors.sucursalId && <span className="error-text">{errors.sucursalId.message}</span>}
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="section-title">
          <Calendar size={18} />
          <h3>Fechas y Plazos</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input type="date" {...register('fechaInicio')} />
          </div>
          <div className="form-group">
            <label>Fin Previsto</label>
            <input type="date" {...register('fechaFinPrevista')} />
          </div>
        </div>
      </section>

      <section className="form-section">
        <div className="section-title">
          <Package size={18} />
          <h3>Equipos a Alquilar</h3>
        </div>

        <div className="items-list-form">
          {fields.map((field, index) => (
            <div key={field.id} className="item-row card-premium">
              <div className="input-group">
                <label>Activo Disponible</label>
                <select 
                  {...register(`items.${index}.activoId` as const)}
                  onChange={(e) => {
                    const selected = activos.find((a: any) => a.id === e.target.value);
                    if (selected) {
                      // Logic could be added here to auto-fill current price/tarifa
                    }
                  }}
                >
                  <option value="">Seleccione equipo...</option>
                  {activos.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      [{a.codigoInterno}] {a.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group price">
                <label>Precio Unit. (USD)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  {...register(`items.${index}.precioUnitario` as const, { valueAsNumber: true })} 
                />
              </div>

              <button type="button" className="btn-remove" onClick={() => remove(index)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button type="button" className="btn-add-item" onClick={() => append({ activoId: '', precioUnitario: 0 })}>
            <Plus size={16} /> Agregar otro equipo
          </button>
        </div>
      </section>

      <div className="total-summary-form">
        <div className="total-label">
          <Calculator size={20} />
          <span>Total Estimado</span>
        </div>
        <div className="total-value">USD {total.toLocaleString()}</div>
      </div>

      <div className="form-group">
        <label>Notas Internas / Condiciones Especiales</label>
        <textarea {...register('notas')} rows={3} placeholder="Ingrese notas relevantes para el contrato..." />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
          <ArrowRight size={18} />
          {createMutation.isPending ? 'Creando...' : 'Crear Reserva'}
        </button>
      </div>
    </form>
  );
};

export default AlquilerForm;
