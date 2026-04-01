import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Truck, 
  RotateCcw, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2 
} from 'lucide-react';
import { useCheckOut, useCheckIn } from '../hooks/useAlquileresData';
import { AlquilerItem } from '../types';
import './CheckInOutForm.css';

const baseSchema = z.object({
  horometro: z.number().min(0, 'El horómetro no puede ser negativo'),
  combustible: z.number().min(0).max(100, 'El nivel debe estar entre 0 y 100%'),
  observaciones: z.string().optional(),
});

const checkInSchema = baseSchema.extend({
  danos: z.array(z.object({
    descripcion: z.string().min(3, 'Descripción requerida'),
    gravedad: z.enum(['LEVE', 'MODERADO', 'GRAVE']),
    costoEstimado: z.number().optional(),
  })).optional(),
});

type FormData = z.infer<typeof checkInSchema>;

interface Props {
  alquilerId: string;
  item: AlquilerItem;
  mode: 'out' | 'in';
  onCancel: () => void;
  onSuccess: () => void;
}

const CheckInOutForm: React.FC<Props> = ({ alquilerId, item, mode, onCancel, onSuccess }) => {
  const checkOutMutation = useCheckOut();
  const checkInMutation = useCheckIn();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(mode === 'out' ? baseSchema : checkInSchema),
    defaultValues: {
      horometro: 0,
      combustible: 100,
      danos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'danos',
  });

  const onSubmit = (data: FormData) => {
    if (mode === 'out') {
      checkOutMutation.mutate({
        id: alquilerId,
        activoId: item.activoId,
        horometroInicial: data.horometro,
        combustibleInicial: data.combustible,
        observaciones: data.observaciones,
      }, { onSuccess });
    } else {
      checkInMutation.mutate({
        alquilerId,
        activoId: item.activoId,
        horometroFinal: data.horometro,
        combustibleFinal: data.combustible,
        observaciones: data.observaciones,
        danos: data.danos,
      }, { onSuccess });
    }
  };

  const isPending = checkOutMutation.isPending || checkInMutation.isPending;

  return (
    <form className="check-io-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="item-summary card-premium">
        <Truck size={20} className={mode === 'out' ? 'icon-out' : 'icon-in'} />
        <div className="info">
          <strong>{item.activo?.nombre}</strong>
          <span>ID: {item.activo?.codigoInterno}</span>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Horómetro {mode === 'out' ? 'Inicial' : 'Final'}</label>
          <input 
            type="number" 
            step="0.1"
            {...register('horometro', { valueAsNumber: true })} 
            placeholder="0.0"
          />
          {errors.horometro && <span className="error-text">{errors.horometro.message}</span>}
        </div>

        <div className="form-group">
          <label>Nivel de Combustible (%)</label>
          <input 
            type="number" 
            {...register('combustible', { valueAsNumber: true })} 
            placeholder="100"
          />
          {errors.combustible && <span className="error-text">{errors.combustible.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Observaciones Operativas</label>
        <textarea 
          {...register('observaciones')} 
          placeholder="Estado de neumáticos, mangueras, limpieza, etc."
          rows={3}
        />
      </div>

      {mode === 'in' && (
        <div className="danos-section">
          <div className="section-header">
            <h3>Registro de Daños / Novedades</h3>
            <button type="button" className="btn-add-dano" onClick={() => append({ descripcion: '', gravedad: 'LEVE' })}>
              <Plus size={14} /> Reportar Daño
            </button>
          </div>

          <div className="danos-list">
            {fields.map((field, index) => (
              <div key={field.id} className="dano-item card-premium">
                <div className="dano-row">
                  <div className="input-group main">
                    <input 
                      {...register(`danos.${index}.descripcion` as const)} 
                      placeholder="Ej: Rotura de cristal lateral"
                    />
                  </div>
                  <select {...register(`danos.${index}.gravedad` as const)}>
                    <option value="LEVE">Leve</option>
                    <option value="MODERADO">Moderado</option>
                    <option value="GRAVE">Grave</option>
                  </select>
                  <button type="button" className="btn-remove" onClick={() => remove(index)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="no-danos">
                <CheckCircle2 size={16} />
                <span>Equipo recibido sin daños reportados.</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Procesando...' : mode === 'out' ? 'Completar Entrega' : 'Completar Devolución'}
        </button>
      </div>
    </form>
  );
};

export default CheckInOutForm;
