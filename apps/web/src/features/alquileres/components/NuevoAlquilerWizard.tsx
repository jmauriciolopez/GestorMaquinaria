import React, { useState } from 'react';
import { useClientes, useCrearAlquiler } from '../hooks/useAlquileresData';
import { useActivosDisponibles, useSucursales } from '../../activos/hooks/useActivosData';
import { Activo } from '../../activos/types';
import { useToast } from '../../../context/ToastContext';
import './NuevoAlquilerWizard.css';

interface Props { onSuccess: (id: string) => void; onCancel: () => void; }
interface ItemSel { activo: Activo; precioUnitario: number; }

export const NuevoAlquilerWizard: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [paso, setPaso]               = useState(1);
  const [clienteId, setClienteId]     = useState('');
  const [sucursalId, setSucursalId]   = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [items, setItems]             = useState<ItemSel[]>([]);
  const [notas, setNotas]             = useState('');
  const [busqCliente, setBusqCliente] = useState('');

  const { data: clientes  = [] } = useClientes(busqCliente);
  const { data: activos   = [] } = useActivosDisponibles();
  const { data: sucursales= [] } = useSucursales();
  const crearAlquiler             = useCrearAlquiler();
  const { success, error }        = useToast();

  const toggleActivo = (activo: Activo) =>
    setItems((prev) => prev.find((i) => i.activo.id === activo.id)
      ? prev.filter((i) => i.activo.id !== activo.id)
      : [...prev, { activo, precioUnitario: 0 }]);

  const updatePrecio = (id: string, precio: number) =>
    setItems((prev) => prev.map((i) => i.activo.id === id ? { ...i, precioUnitario: precio } : i));

  const subtotal = items.reduce((acc, i) => acc + i.precioUnitario, 0);

  const handleSubmit = async () => {
    if (!clienteId || !sucursalId || !fechaInicio || !fechaFin || items.length === 0) {
      error('Completá todos los campos requeridos');
      return;
    }
    try {
      const result = await crearAlquiler.mutateAsync({
        clienteId, sucursalId, notas,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFinPrevista: new Date(fechaFin).toISOString(),
        items: items.map((i) => ({
          activoId: i.activo.id,
          precioUnitario: i.precioUnitario,
          subtotal: i.precioUnitario,
        })),
      });
      success('Alquiler creado correctamente');
      onSuccess(result?.id ?? '');
    } catch {
      error('No se pudo crear el alquiler. Revisá los datos.');
    }
  };

  const pasoValido1 = clienteId && sucursalId && fechaInicio && fechaFin;

  return (
    <div className="wizard">
      <div className="wizard-stepper">
        {['Cliente y fechas', 'Equipos', 'Confirmación'].map((label, idx) => (
          <div key={label} className={`wizard-step ${paso === idx + 1 ? 'active' : ''} ${paso > idx + 1 ? 'done' : ''}`}>
            <div className="step-circle">{paso > idx + 1 ? '✓' : idx + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {paso === 1 && (
        <div className="wizard-body">
          <label className="field-label">Sucursal *</label>
          <select className="field-input" value={sucursalId} onChange={(e) => setSucursalId(e.target.value)}>
            <option value="">Seleccionar sucursal...</option>
            {(sucursales as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>

          <label className="field-label">Buscar cliente</label>
          <input className="field-input" placeholder="Nombre o documento..." value={busqCliente} onChange={(e) => setBusqCliente(e.target.value)} />
          <select className="field-input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Seleccionar cliente *</option>
            {(clientes as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.nombre} — {c.documento}</option>)}
          </select>

          <div className="field-row">
            <div>
              <label className="field-label">Fecha inicio *</label>
              <input type="datetime-local" className="field-input" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Fecha fin prevista *</label>
              <input type="datetime-local" className="field-input" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
          </div>

          <label className="field-label">Notas</label>
          <textarea className="field-input" rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones opcionales..." />

          <button className="btn-primary wizard-next" onClick={() => setPaso(2)} disabled={!pasoValido1}>
            Siguiente →
          </button>
        </div>
      )}

      {paso === 2 && (
        <div className="wizard-body">
          <p className="wizard-hint">Seleccioná los equipos y asigná el precio unitario.</p>
          <div className="activos-grid">
            {(activos as Activo[]).map((activo) => {
              const sel = items.find((i) => i.activo.id === activo.id);
              return (
                <div key={activo.id} className={`activo-card ${sel ? 'selected' : ''}`} onClick={() => toggleActivo(activo)}>
                  <div className="activo-card-top">
                    <strong>{activo.codigoInterno}</strong>
                    <span className="activo-modelo">{activo.modelo?.nombre}</span>
                  </div>
                  {sel && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input type="number" className="precio-input" placeholder="Precio $"
                        value={sel.precioUnitario || ''} onChange={(e) => updatePrecio(activo.id, Number(e.target.value))} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {activos.length === 0 && <p className="wizard-empty">No hay activos disponibles.</p>}
          <div className="wizard-nav">
            <button className="btn-secondary" onClick={() => setPaso(1)}>← Atrás</button>
            <button className="btn-primary" onClick={() => setPaso(3)} disabled={items.length === 0}>Siguiente →</button>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="wizard-body">
          <div className="confirm-section">
            <h4>Resumen del alquiler</h4>
            <div className="confirm-row"><span>Cliente</span><strong>{(clientes as any[]).find((c: any) => c.id === clienteId)?.nombre}</strong></div>
            <div className="confirm-row"><span>Inicio</span><strong>{new Date(fechaInicio).toLocaleDateString('es-AR')}</strong></div>
            <div className="confirm-row"><span>Fin previsto</span><strong>{new Date(fechaFin).toLocaleDateString('es-AR')}</strong></div>
            <div className="confirm-row"><span>Equipos</span><strong>{items.length}</strong></div>
            <div className="confirm-row total-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          </div>
          <ul className="confirm-items">
            {items.map((i) => (
              <li key={i.activo.id}>
                <span>{i.activo.codigoInterno} — {i.activo.modelo?.nombre}</span>
                <span>${i.precioUnitario.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="wizard-nav">
            <button className="btn-secondary" onClick={() => setPaso(2)}>← Atrás</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={crearAlquiler.isPending}>
              {crearAlquiler.isPending ? 'Creando...' : 'Crear Alquiler'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
