import React, { useState } from 'react';
import { useCheckOut } from '../hooks/useAlquileresData';
import { AlquilerItem } from '../types';
import { useToast } from '../../../context/ToastContext';

interface Props { alquilerId: string; items: AlquilerItem[]; onSuccess: () => void; onCancel: () => void; }

export const CheckOutForm: React.FC<Props> = ({ alquilerId, items, onSuccess, onCancel }) => {
  const checkOut = useCheckOut();
  const { success, error } = useToast();
  const [forms, setForms] = useState<Record<string, { condicion: string; obs: string }>>(
    Object.fromEntries(items.map((i) => [i.activoId, { condicion: '', obs: '' }]))
  );

  const update = (activoId: string, field: string, value: string) =>
    setForms((prev) => ({ ...prev, [activoId]: { ...prev[activoId], [field]: value } }));

  const handleSubmit = async () => {
    try {
      for (const item of items) {
        const f = forms[item.activoId] ?? { condicion: '', obs: '' };
        await checkOut.mutateAsync({ id: alquilerId, activoId: item.activoId, condicionSalida: f.condicion, observaciones: f.obs });
      }
      success('Check-Out registrado correctamente');
      onSuccess();
    } catch {
      error('No se pudo completar el check-out');
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 13, boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', margin: '8px 0 4px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
        Registrá la condición de salida de cada equipo antes de la entrega.
      </p>
      {items.map((item) => (
        <div key={item.activoId} style={{ background: 'var(--color-surface-hover)', borderRadius: 10, padding: 14 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
            {item.activo?.codigoInterno ?? item.activoId.slice(0, 8)}
          </p>
          <label style={lbl}>Condición de salida</label>
          <input style={inp} placeholder="Ej: Sin daños visibles, operativo..."
            value={forms[item.activoId]?.condicion ?? ''}
            onChange={(e) => update(item.activoId, 'condicion', e.target.value)} />
          <label style={lbl}>Observaciones</label>
          <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }}
            value={forms[item.activoId]?.obs ?? ''}
            onChange={(e) => update(item.activoId, 'obs', e.target.value)} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={checkOut.isPending}>
          {checkOut.isPending ? 'Procesando...' : '📤 Confirmar Check-Out'}
        </button>
      </div>
    </div>
  );
};
