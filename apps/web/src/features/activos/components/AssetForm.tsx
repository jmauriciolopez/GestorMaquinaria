import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useCategorias,
  useModelos,
  useSucursales,
  useMutateActivo
} from '../hooks/useActivosData';
import { Activo, EstadoActivo } from '../types';
import './AssetForm.css';

const assetSchema = z.object({
  codigoInterno: z.string().min(1, 'El código interno es requerido').max(60),
  numeroSerie: z.string().max(120).optional(),
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  sucursalId: z.string().uuid('Seleccione una sucursal válida'),
  categoriaId: z.string().uuid('Seleccione una categoría'),
  modeloId: z.string().uuid('Seleccione un modelo válido'),
  estado: z.nativeEnum(EstadoActivo).optional(),
  annoFabricacion: z.number().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  fechaAdquisicion: z.string().optional().nullable(),
  valorAdquisicion: z.number().min(0).optional().nullable(),
  notas: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetFormProps {
  initialData?: Activo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { data: categorias } = useCategorias();
  const { data: sucursales } = useSucursales();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData ? {
      codigoInterno: initialData.codigoInterno,
      numeroSerie: initialData.numeroSerie || '',
      nombre: initialData.modelo?.nombre,
      sucursalId: initialData.sucursal?.id,
      categoriaId: initialData.modelo?.categoria?.id,
      modeloId: initialData.modelo?.id,
      estado: initialData.estado,
      // Advanced fields (assuming they might come from backend later)
      annoFabricacion: initialData.annoFabricacion ?? null,
      fechaAdquisicion: initialData.fechaAdquisicion ?? '',
      valorAdquisicion: initialData.valorAdquisicion ?? null,
      notas: initialData.notas ?? '',
    } : {
      estado: EstadoActivo.DISPONIBLE
    }
  });

  const selectedCategoriaId = watch('categoriaId');
  const { data: modelos } = useModelos(selectedCategoriaId);
  const mutate = useMutateActivo(initialData?.id);

  // Reset modelo if categoria changes
  useEffect(() => {
    if (selectedCategoriaId && initialData?.modelo?.categoria?.id !== selectedCategoriaId) {
      setValue('modeloId', '');
    }
  }, [selectedCategoriaId, setValue, initialData]);

  const onSubmit = async (values: AssetFormValues) => {
    try {
      // Omitimos campos que solo son para control de UI floral
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nombre, categoriaId, ...payload } = values;
      await mutate.mutateAsync(payload as Partial<Activo>);
      onSuccess();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  return (
    <form className="asset-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-section">
        <h4>Información Básica</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Código Interno *</label>
            <input {...register('codigoInterno')} placeholder="Ej: EXC-001" className={errors.codigoInterno ? 'error' : ''} />
            {errors.codigoInterno && <span className="error-msg">{errors.codigoInterno.message}</span>}
          </div>

          <div className="form-group">
            <label>Número de Serie</label>
            <input {...register('numeroSerie')} placeholder="OEM Serial Number" />
          </div>

          <div className="form-group full-width">
            <label>Nombre del Equipo *</label>
            <input {...register('nombre')} placeholder="Ej: Excavadora Hidráulica Cat 320" className={errors.nombre ? 'error' : ''} />
            {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Configuración Técnica</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Categoría *</label>
            <select {...register('categoriaId')} className={errors.categoriaId ? 'error' : ''}>
              <option value="">Seleccionar...</option>
              {categorias?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {errors.categoriaId && <span className="error-msg">{errors.categoriaId.message}</span>}
          </div>

          <div className="form-group">
            <label>Modelo * {selectedCategoriaId ? '' : '(Elija categoría primero)'}</label>
            <select {...register('modeloId')} disabled={!selectedCategoriaId} className={errors.modeloId ? 'error' : ''}>
              <option value="">Seleccionar...</option>
              {modelos?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            {errors.modeloId && <span className="error-msg">{errors.modeloId.message}</span>}
          </div>

          <div className="form-group">
            <label>Sucursal de Asignación *</label>
            <select {...register('sucursalId')} className={errors.sucursalId ? 'error' : ''}>
              <option value="">Seleccionar...</option>
              {sucursales?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            {errors.sucursalId && <span className="error-msg">{errors.sucursalId.message}</span>}
          </div>

          <div className="form-group">
            <label>Estado Inicial</label>
            <select {...register('estado')}>
              {Object.values(EstadoActivo).map(e => (
                <option key={e} value={e}>{e.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Datos de Adquisición (Avanzado)</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Año de Fabricación</label>
            <input
              type="number"
              {...register('annoFabricacion', { valueAsNumber: true })}
              placeholder="YYYY"
            />
          </div>

          <div className="form-group">
            <label>Fecha de Compra</label>
            <input type="date" {...register('fechaAdquisicion')} />
          </div>

          <div className="form-group">
            <label>Valor de Compra (USD)</label>
            <input
              type="number"
              step="0.01"
              {...register('valorAdquisicion', { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <label>Notas Adicionales</label>
        <textarea {...register('notas')} rows={3} placeholder="Detalles técnicos adicionales, estado de recepción, etc."></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Activo' : 'Crear Activo'}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
