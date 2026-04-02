import React, { useState } from 'react';
import { useCheckIn } from '../hooks/useAlquileresData';
import { AlquilerItem } from '../types';
import { useToast } from '../../../context/ToastContext';

interface DanoForm { descripcion: string; costoEstimado: string; }
interface ItemForm { condicion: string; obs: string; tieneDanios: boolean; tieneRetraso: boolean; horasRetraso: string; danos: DanoForm[]; }
interface Props { alquilerId: string; items: AlquilerItem[]; onSuccess: () => void; onCancel: () => void; }

export const CheckInForm: React.FC<Props> = ({ alquilerId, items, onSuccess, onCancel }) => {
  const checkIn = useCheckIn();
  const { success, error } = useToast();
  const [forms, setForms] = useState<Record<string, ItemForm>>(
    Object.fromEntries(items.map((i) => [i.activoId, { condicion: '', obs: '', tieneDanios: false, tieneRetraso: false, horasRetraso: '', danos: [] }]))
  );

  const update = (id: string, field: string, value: unknown) =>
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const addDano = (id: string) =>
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], danos: [...prev[id].danos, { descripcion: '', costoEstimado: '' }] } }));

  const updateDano = (id: string, idx: number, field: string, value: string) =>
    setForms((prev) => {
      const danos = [...prev[id].danos];
      danos[idx] = { ...danos[idx], [field]: value };
      return { ...prev, [id]: { ...prev[id], danos } };
    });

  const handleSubmit = async () => {
    try {
      for (const item of items) {
        const f = forms[item.activoId];
        await checkIn.mutateAsync({
          alquilerId, activoId: item.activoId,
          condicionRetorno: f.condicion, observaciones: f.obs,
          tieneDanios: f.tieneDanios, tieneRetraso: f.tieneRetraso,
          horasRetraso: f.tieneRetraso ? Number(f.horasRetraso) : 0,
          danos: f.tieneDanios
            ? f.danos.filter((d) => d.descripcion).map((d) => ({
                descripcion: d.descripcion,
                costoEstimado: d.costoEstimado ? Number(d.costoEstimado) : undefined,
              }))
            : [],
        });
      }
      success('Check-In registrado correctamente');
      onSuccess();
    } catch {
      error('No se pudo completar el check-in');
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 13, boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', margin: '8px 0 4px' };
  const chkLbl: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text-primary)', cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
        Registrá el retorno. Daños y retrasos quedarán documentados.
      </p>
      {items.map((item) => {
        const f = forms[item.activoId];
        return (
          <div key={item.activoId} style={{ background: 'var(--color-surface-hover)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
              {item.activo?.codigoInterno ?? item.activoId.slice(0, 8)}
            </p>
            <label style={lbl}>Condición de retorno</label>
            <input style={inp} placeholder="Estado del equipo al regresar..." value={f.condicion} onChange={(e) => update(item.activoId, 'condicion', e.target.value)} />
            <label style={lbl}>Observaciones</label>
            <textarea style={{ ...inp, minHeight: 50, resize: 'vertical' }} value={f.obs} onChange={(e) => update(item.activoId, 'obs', e.target.value)} />

            <label style={chkLbl}>
              <input type="checkbox" checked={f.tieneRetraso} onChange={(e) => update(item.activoId, 'tieneRetraso', e.target.checked)} />
              ¿Hubo retraso en la devolución?
            </label>
            {f.tieneRetraso && (
              <input style={inp} type="number" placeholder="Horas de retraso" value={f.horasRetraso} onChange={(e) => update(item.activoId, 'horasRetraso', e.target.value)} />
            )}

            <label style={chkLbl}>
              <input type="checkbox" checked={f.tieneDanios} onChange={(e) => update(item.activoId, 'tieneDanios', e.target.checked)} />
              ¿El equipo presenta daños?
            </label>
            {f.tieneDanios && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {f.danos.map((d, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
                    <input style={inp} placeholder="Descripción del daño" value={d.descripcion} onChange={(e) => updateDano(item.activoId, idx, 'descripcion', e.target.value)} />
                    <input style={inp} type="number" placeholder="$ costo" value={d.costoEstimado} onChange={(e) => updateDano(item.activoId, idx, 'costoEstimado', e.target.value)} />
                  </div>
                ))}
                <button style={{ background: 'none', border: '1px dashed var(--color-border)', borderRadius: 6, color: 'var(--color-primary)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }} onClick={() => addDano(item.activoId)}>
                  + Agregar daño
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={checkIn.isPending}>
          {checkIn.isPending ? 'Procesando...' : '📥 Confirmar Devolución'}
        </button>
      </div>
    </div>
  );
};
