import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard } from 'lucide-react';
import {
  useAlquiler, useConfirmarAlquiler, usePenalidades,
} from '../features/alquileres/hooks/useAlquileresData';
import { usePagarConMP } from '../features/alquileres/hooks/useMercadoPago';
import { CheckOutForm } from '../features/alquileres/components/CheckOutForm';
import { CheckInForm } from '../features/alquileres/components/CheckInForm';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../context/ToastContext';
import './AlquilerDetail.css';

const estadoBadge: Record<string, { label: string; variant: BadgeVariant }> = {
  borrador:         { label: 'Borrador',     variant: 'secondary' },
  confirmado:       { label: 'Confirmado',   variant: 'primary'   },
  entregado:        { label: 'Entregado',    variant: 'info'      },
  devuelto_parcial: { label: 'Dev. Parcial', variant: 'warning'   },
  devuelto:         { label: 'Devuelto',     variant: 'success'   },
  cancelado:        { label: 'Cancelado',    variant: 'error'     },
  vencido:          { label: 'Vencido',      variant: 'error'     },
};

const AlquilerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: alquiler, isLoading, refetch } = useAlquiler(id);
  const { data: penalidades = [] } = usePenalidades(id);
  const confirmar    = useConfirmarAlquiler();
  const pagarConMP   = usePagarConMP();
  const { success, error, info } = useToast();
  const [drawerMode, setDrawerMode] = useState<null | 'checkout' | 'checkin'>(null);

  // Manejar redirect de MercadoPago
  useEffect(() => {
    const mp = searchParams.get('mp');
    if (mp === 'success') { success('¡Pago aprobado por MercadoPago!'); refetch(); }
    if (mp === 'failure') { error('El pago fue rechazado. Intentá de nuevo.'); }
    if (mp === 'pending') { info('Pago pendiente de acreditación. Te notificaremos.'); }
    if (mp) navigate(`/alquileres/${id}`, { replace: true });
  }, []);

  if (isLoading) return <div className="detail-loading">Cargando alquiler...</div>;
  if (!alquiler) return <div className="detail-loading">Alquiler no encontrado.</div>;

  const cfg            = estadoBadge[alquiler.estado] ?? { label: alquiler.estado, variant: 'secondary' as BadgeVariant };
  const puedeConfirmar = alquiler.estado === 'borrador';
  const puedeCheckOut  = alquiler.estado === 'confirmado';
  const puedeCheckIn   = alquiler.estado === 'entregado' || alquiler.estado === 'devuelto_parcial';
  const saldoPendiente = Number(alquiler.subtotal) + Number(alquiler.totalPenalidades) - Number(alquiler.totalPagado);
  const puedePagar     = saldoPendiente > 0;

  const handleConfirmar = async () => {
    try { await confirmar.mutateAsync(id!); success('Alquiler confirmado'); refetch(); }
    catch { error('No se pudo confirmar el alquiler'); }
  };

  const handlePagarMP = async () => {
    try {
      const result = await pagarConMP.mutateAsync({
        alquilerId:  id!,
        monto:       saldoPendiente,
        descripcion: `Alquiler #${id!.slice(0, 8)} — ${alquiler.cliente?.nombre ?? ''}`,
      });
      // En producción usar result.initPoint, en sandbox usar result.sandboxInitPoint
      const url = result.sandboxInitPoint || result.initPoint;
      if (url) window.open(url, '_blank');
      else error('No se pudo obtener el link de pago');
    } catch {
      error('Error al conectar con MercadoPago');
    }
  };

  return (
    <div className="alquiler-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/alquileres')}>
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="detail-title">
          <h1>Alquiler <span className="detail-id">#{alquiler.id.slice(0, 8)}</span></h1>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </div>
        <div className="detail-actions">
          {puedeConfirmar && (
            <button className="btn-primary" onClick={handleConfirmar} disabled={confirmar.isPending}>
              <CheckCircle size={16} /> Confirmar
            </button>
          )}
          {puedeCheckOut && (
            <button className="btn-primary" onClick={() => setDrawerMode('checkout')}>
              📤 Check-Out
            </button>
          )}
          {puedeCheckIn && (
            <button className="btn-success" onClick={() => setDrawerMode('checkin')}>
              📥 Check-In
            </button>
          )}
          {puedePagar && (
            <button className="btn-mp" onClick={handlePagarMP} disabled={pagarConMP.isPending}>
              <CreditCard size={16} />
              {pagarConMP.isPending ? 'Generando link...' : `Pagar $${saldoPendiente.toFixed(2)} con MP`}
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="card-premium detail-card">
          <h3>Información general</h3>
          <div className="info-rows">
            <div className="info-row"><span>Cliente</span><strong>{alquiler.cliente?.nombre}</strong></div>
            <div className="info-row"><span>Inicio</span><strong>{new Date(alquiler.fechaInicio).toLocaleDateString('es-AR')}</strong></div>
            <div className="info-row"><span>Vencimiento</span>
              <strong style={{ color: new Date(alquiler.fechaFinPrevista) < new Date() && alquiler.estado === 'entregado' ? '#ef4444' : 'inherit' }}>
                {new Date(alquiler.fechaFinPrevista).toLocaleDateString('es-AR')}
              </strong>
            </div>
            {alquiler.fechaFinReal && (
              <div className="info-row"><span>Devuelto</span><strong>{new Date(alquiler.fechaFinReal).toLocaleDateString('es-AR')}</strong></div>
            )}
            {alquiler.notas && <div className="info-row"><span>Notas</span><span>{alquiler.notas}</span></div>}
          </div>
        </div>

        <div className="card-premium detail-card">
          <h3>Equipos ({alquiler.items?.length ?? 0})</h3>
          <ul className="items-list">
            {alquiler.items?.map((item) => (
              <li key={item.id} className="item-row">
                <div>
                  <strong>{item.activo?.codigoInterno ?? item.activoId.slice(0, 8)}</strong>
                  <span className="item-modelo">{(item.activo as any)?.nombre}</span>
                </div>
                <span className="item-precio">${Number(item.precioUnitario).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-premium detail-card">
          <h3>Resumen financiero</h3>
          <div className="info-rows">
            <div className="info-row"><span>Subtotal</span><strong>${Number(alquiler.subtotal).toFixed(2)}</strong></div>
            <div className="info-row"><span>Penalidades</span>
              <strong style={{ color: Number(alquiler.totalPenalidades) > 0 ? '#ef4444' : 'inherit' }}>
                ${Number(alquiler.totalPenalidades).toFixed(2)}
              </strong>
            </div>
            <div className="info-row"><span>Total pagado</span>
              <strong style={{ color: '#22c55e' }}>${Number(alquiler.totalPagado).toFixed(2)}</strong>
            </div>
            <div className="info-row total-row">
              <span>Saldo pendiente</span>
              <strong style={{ color: saldoPendiente > 0 ? '#f59e0b' : '#22c55e' }}>
                ${saldoPendiente.toFixed(2)}
              </strong>
            </div>
          </div>
          {puedePagar && (
            <button className="btn-mp btn-mp--block" onClick={handlePagarMP} disabled={pagarConMP.isPending}>
              <CreditCard size={16} />
              {pagarConMP.isPending ? 'Generando link...' : 'Pagar con MercadoPago'}
            </button>
          )}
        </div>

        {penalidades.length > 0 && (
          <div className="card-premium detail-card">
            <h3>Penalidades ({penalidades.length})</h3>
            <ul className="items-list">
              {penalidades.map((p) => (
                <li key={p.id} className="item-row">
                  <div>
                    <strong>{(p as any).tipo?.toUpperCase()}</strong>
                    <span className="item-modelo">{(p as any).descripcion ?? ''}</span>
                  </div>
                  <span className="item-precio" style={{ color: '#ef4444' }}>
                    ${Number((p as any).montoOverride ?? (p as any).monto ?? 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Drawer isOpen={drawerMode === 'checkout'} onClose={() => setDrawerMode(null)} title="Check-Out — Entrega de equipos">
        {alquiler.items && (
          <CheckOutForm alquilerId={alquiler.id} items={alquiler.items}
            onSuccess={() => { setDrawerMode(null); refetch(); }}
            onCancel={() => setDrawerMode(null)} />
        )}
      </Drawer>

      <Drawer isOpen={drawerMode === 'checkin'} onClose={() => setDrawerMode(null)} title="Check-In — Devolución de equipos">
        {alquiler.items && (
          <CheckInForm alquilerId={alquiler.id} items={alquiler.items}
            onSuccess={() => { setDrawerMode(null); refetch(); }}
            onCancel={() => setDrawerMode(null)} />
        )}
      </Drawer>
    </div>
  );
};

export default AlquilerDetail;
