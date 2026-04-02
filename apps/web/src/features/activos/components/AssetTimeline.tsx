import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Wrench, ShieldCheck, Truck, Hash, RotateCcw, AlertCircle } from 'lucide-react';
import { MovimientoActivo, TipoMovimiento } from '../types';
import './AssetTimeline.css';

const TIPO_CONFIG: Record<TipoMovimiento, { label: string; icon: React.ReactNode; color: string }> = {
  [TipoMovimiento.CHECK_OUT]:             { label: 'Entrega (Check-out)',       icon: <ArrowUpRight size={14} />,   color: 'info' },
  [TipoMovimiento.CHECK_IN]:              { label: 'Devolución (Check-in)',      icon: <ArrowDownLeft size={14} />,  color: 'success' },
  [TipoMovimiento.TRASLADO]:              { label: 'Traslado',                   icon: <Truck size={14} />,          color: 'primary' },
  [TipoMovimiento.ENTRADA_MANTENIMIENTO]: { label: 'Ingreso a Mantenimiento',    icon: <Wrench size={14} />,         color: 'warning' },
  [TipoMovimiento.SALIDA_MANTENIMIENTO]:  { label: 'Salida de Mantenimiento',    icon: <ShieldCheck size={14} />,    color: 'success' },
  [TipoMovimiento.BAJA]:                  { label: 'Baja de Activo',             icon: <AlertCircle size={14} />,    color: 'error' },
  [TipoMovimiento.AJUSTE]:                { label: 'Ajuste de Estado',           icon: <RotateCcw size={14} />,      color: 'secondary' },
};

interface AssetTimelineProps {
  items?: MovimientoActivo[];
  isLoading?: boolean;
}

const AssetTimeline: React.FC<AssetTimelineProps> = ({ items, isLoading }) => {
  if (isLoading) return <div className="timeline-loading">Cargando historial...</div>;
  if (!items || items.length === 0) return (
    <div className="timeline-empty">
      <Hash size={32} />
      <p>Sin movimientos registrados.</p>
    </div>
  );

  return (
    <div className="timeline-container">
      {items.map((item) => {
        const config = TIPO_CONFIG[item.tipo] ?? { label: item.tipo, icon: <Hash size={14} />, color: 'secondary' };
        return (
          <div key={item.id} className="timeline-item">
            <div className="timeline-line" />
            <div className={`timeline-marker marker-${config.color}`}>
              {config.icon}
            </div>
            <div className="timeline-content card-premium">
              <div className="timeline-header">
                <span className="timeline-type">{config.label}</span>
                <span className="timeline-date">
                  {new Date(item.createdAt).toLocaleString('es-AR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="timeline-states">
                {item.estadoAnterior && (
                  <span className="state-chip state-from">{item.estadoAnterior}</span>
                )}
                {item.estadoAnterior && <span className="state-arrow">→</span>}
                <span className="state-chip state-to">{item.estadoNuevo}</span>
              </div>

              {item.observaciones && (
                <p className="timeline-desc">{item.observaciones}</p>
              )}

              <div className="timeline-footer">
                {item.usuario && (
                  <div className="footer-meta">
                    <span>{item.usuario.nombre}</span>
                  </div>
                )}
                {item.ubicacionDestino && (
                  <div className="footer-meta">
                    <span>→ {item.ubicacionDestino}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssetTimeline;
