import React from 'react';
import { 
  Calendar, 
  User, 
  MapPin, 
  ShieldCheck, 
  Wrench, 
  Truck,
  Hash
} from 'lucide-react';
import './AssetTimeline.css';

interface TimelineItem {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  usuario?: { nombre: string };
  metadata?: any;
}

interface AssetTimelineProps {
  items: TimelineItem[];
  isLoading?: boolean;
}

const getIcon = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case 'entrada': return <Truck size={16} />;
    case 'salida': return <Truck size={16} />;
    case 'mantenimiento_inicio': return <Wrench size={16} />;
    case 'mantenimiento_fin': return <ShieldCheck size={16} />;
    case 'creacion': return <Hash size={16} />;
    default: return <Calendar size={16} />;
  }
};

const AssetTimeline: React.FC<AssetTimelineProps> = ({ items, isLoading }) => {
  if (isLoading) return <div className="timeline-loading">Cargando historial...</div>;
  if (!items || items.length === 0) return <div className="timeline-empty">Sin movimientos registrados.</div>;

  return (
    <div className="timeline-container">
      {items.map((item, index) => (
        <div key={item.id} className="timeline-item">
          <div className="timeline-line"></div>
          <div className={`timeline-marker marker-${item.tipo.toLowerCase()}`}>
            {getIcon(item.tipo)}
          </div>
          <div className="timeline-content card-premium">
            <div className="timeline-header">
              <span className="timeline-type">{item.tipo.replace('_', ' ')}</span>
              <span className="timeline-date">
                {new Date(item.fecha).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="timeline-desc">{item.descripcion}</p>
            <div className="timeline-footer">
              <div className="footer-meta">
                <User size={12} />
                <span>{item.usuario?.nombre || 'Sistema'}</span>
              </div>
              {item.metadata?.ubicacion && (
                <div className="footer-meta">
                  <MapPin size={12} />
                  <span>{item.metadata.ubicacion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetTimeline;
