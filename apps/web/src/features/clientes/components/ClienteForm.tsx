import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Cliente } from '../types';
import { useCreateCliente, useUpdateCliente } from '../hooks/useClientesData';
import './ClienteForm.css';

const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  razonSocial: z.string().optional(),
  tipoDocumento: z.string().optional(),
  documento: z.string().optional(),
  email: z
    .string()
    .optional()
    .transform((v) => (v?.trim() === '' ? undefined : v?.trim()))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: 'Email inválido',
    }),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean().default(true),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  initialData?: Cliente | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const emptyToUndefined = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const buildDefaults = (data?: Cliente | null): ClienteFormValues => ({
  nombre:        data?.nombre        ?? '',
  razonSocial:   data?.razonSocial   ?? '',
  tipoDocumento: data?.tipoDocumento ?? '',
  documento:     data?.documento     ?? '',
  email:         data?.email         ?? '',
  telefono:      data?.telefono      ?? '',
  direccion:     data?.direccion     ?? '',
  notas:         data?.notas         ?? '',
  activo:        data?.activo        ?? true,
});

const ClienteForm: React.FC<ClienteFormProps> = ({
  initialData,
  onCancel,
  onSuccess,
}) => {
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente(initialData?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: buildDefaults(initialData),
  });

  // Reinicializar el form cuando llegue initialData (carga asíncrona o cambio de cliente)
  useEffect(() => {
    reset(buildDefaults(initialData));
  }, [initialData?.id, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: ClienteFormValues) => {
    const payload = {
      nombre:        values.nombre.trim(),
      razonSocial:   emptyToUndefined(values.razonSocial),
      tipoDocumento: emptyToUndefined(values.tipoDocumento),
      documento:     emptyToUndefined(values.documento),
      email:         emptyToUndefined(values.email),
      telefono:      emptyToUndefined(values.telefono),
      direccion:     emptyToUndefined(values.direccion),
      notas:         emptyToUndefined(values.notas),
    };

    if (initialData?.id) {
      await updateMutation.mutateAsync({ ...payload, activo: values.activo });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onSuccess();
  };

  return (
    <form className="cliente-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-grid">
        <div className="form-group">
          <label>Nombre *</label>
          <input {...register('nombre')} className={errors.nombre ? 'error' : ''} />
          {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
        </div>

        <div className="form-group">
          <label>Razón social</label>
          <input {...register('razonSocial')} />
        </div>

        <div className="form-group">
          <label>Tipo documento</label>
          <input {...register('tipoDocumento')} placeholder="NIT, DNI, RUC..." />
        </div>

        <div className="form-group">
          <label>Documento</label>
          <input {...register('documento')} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" {...register('email')} className={errors.email ? 'error' : ''} />
          {errors.email && <span className="error-msg">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input {...register('telefono')} />
        </div>

        <div className="form-group full-width">
          <label>Dirección</label>
          <input {...register('direccion')} />
        </div>

        <div className="form-group full-width">
          <label>Notas</label>
          <textarea rows={3} {...register('notas')} />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input type="checkbox" {...register('activo')} />
            Cliente activo
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : initialData
              ? 'Actualizar Cliente'
              : 'Crear Cliente'}
        </button>
      </div>
    </form>
  );
};

export default ClienteForm;
