import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Settings,
  MoreVertical,
  History
} from 'lucide-react';
import { useActivo, useActivoTimeline } from '../features/activos/hooks/useActivosData';
import AssetTimeline from '../features/activos/components/AssetTimeline';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import { EstadoActivo } from '../features/activos/types';
import Drawer from '../components/ui/Drawer';
import AssetForm from '../features/activos/components/AssetForm';
import './ActivoDetail.css';

const getStatusBadge = (estado?: EstadoActivo) => {
  if (!estado) return null;
  const map: Record<EstadoActivo, { label: string; variant: BadgeVariant }> = {
    [EstadoActivo.DISPONIBLE]: { label: 'Disponible', variant: 'success' },
    [EstadoActivo.ALQUILADO]: { label: 'Alquilado', variant: 'info' },
    [EstadoActivo.EN_MANTENIMIENTO]: { label: 'Mantenimiento', variant: 'warning' },
    [EstadoActivo.FUERA_DE_SERVICIO]: { label: 'Fuera de Servicio', variant: 'error' },
    [EstadoActivo.RESERVADO]: { label: 'Reservado', variant: 'primary' },
  };
  const config = map[estado] || { label: estado, variant: 'secondary' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const ActivoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { data: activo, isLoading } = useActivo(id);
  const { data: timeline, isLoading: isTimelineLoading } = useActivoTimeline(id);

  if (isLoading) return <div className="page-loader">Cargando detalles del activo...</div>;
  if (!activo) return <div className="page-error">No se encontró el activo solicitado.</div>;

  return (
    <div className="activo-detail-wrapper">
      <header className="page-header-simple">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Volver
        </button>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setDrawerOpen(true)}>
            <Settings size={18} />
            Configurar
          </button>
          <button className="btn-icon-more">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="card-premium main-info">
            <div className="info-header">
              <div className="title-group">
                <span className="asset-id">{activo.codigoInterno}</span>
                <h1>{activo.nombre}</h1>
                <p className="asset-serial">S/N: {activo.numeroSerie}</p>
              </div>
              <div className="status-group">
                {getStatusBadge(activo.estado)}
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Categoría</label>
                <span>{activo.modelo?.categoria?.nombre}</span>
              </div>
              <div className="info-item">
                <label>Modelo</label>
                <span>{activo.modelo?.nombre}</span>
              </div>
              <div className="info-item">
                <label>Sucursal Actual</label>
                <div className="with-icon">
                  <MapPin size={14} />
                  <span>{activo.sucursal?.nombre}</span>
                </div>
              </div>
              <div className="info-item">
                <label>Sincronizado</label>
                <div className="with-icon">
                  <Calendar size={14} />
                  <span>{new Date(activo.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="timeline-section">
            <div className="section-header">
              <History size={20} />
              <h2>Historial de Movimientos</h2>
            </div>
            <AssetTimeline items={timeline} isLoading={isTimelineLoading} />
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="card-premium status-card">
            <h3>Situación Operativa</h3>
            {activo.estado === EstadoActivo.EN_MANTENIMIENTO && (
              <div className="alert-box warning">
                <AlertTriangle size={20} />
                <div className="alert-content">
                  <strong>Mantenimiento en curso</strong>
                  <p>Este equipo no puede ser reservado ni alquilado hasta su cierre.</p>
                </div>
              </div>
            )}
            
            <div className="operation-stats">
              <div className="op-stat">
                <label>Disponibilidad</label>
                <span className={activo.estado === EstadoActivo.DISPONIBLE ? 'success' : 'muted'}>
                  {activo.estado === EstadoActivo.DISPONIBLE ? 'INMEDIATA' : 'BLOQUEADA'}
                </span>
              </div>
              <div className="op-stat">
                <label>Días en posesión</label>
                <span>45 días</span>
              </div>
            </div>

            <div className="quick-actions">
              <button className="btn-action-outline">Solicitar Mantenimiento</button>
              <button className="btn-action-outline">Generar QR</button>
            </div>
          </div>

          <div className="card-premium data-card">
            <h3>Ficha Técnica</h3>
            <div className="technical-list">
              <div className="tech-item"><strong>Peso:</strong> 12,400 kg</div>
              <div className="tech-item"><strong>Capacidad:</strong> 1.2 m³</div>
              <div className="tech-item"><strong>Combustible:</strong> Diesel</div>
            </div>
          </div>
        </aside>
      </div>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title="Editar Especificaciones"
      >
        <AssetForm 
          initialData={activo} 
          onCancel={() => setDrawerOpen(false)}
          onSuccess={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};

export default ActivoDetail;
