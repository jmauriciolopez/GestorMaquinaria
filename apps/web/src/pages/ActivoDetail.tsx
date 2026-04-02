import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, AlertTriangle, Settings,
  History, DollarSign, Hash, Wrench, Tag,
} from 'lucide-react';
import { useActivo, useActivoTimeline } from '../features/activos/hooks/useActivosData';
import AssetTimeline from '../features/activos/components/AssetTimeline';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import { EstadoActivo } from '../features/activos/types';
import Drawer from '../components/ui/Drawer';
import AssetForm from '../features/activos/components/AssetForm';
import './ActivoDetail.css';

const STATUS_MAP: Record<EstadoActivo, { label: string; variant: BadgeVariant }> = {
  [EstadoActivo.DISPONIBLE]:        { label: 'Disponible',        variant: 'success' },
  [EstadoActivo.ALQUILADO]:         { label: 'Alquilado',         variant: 'info' },
  [EstadoActivo.EN_MANTENIMIENTO]:  { label: 'Mantenimiento',     variant: 'warning' },
  [EstadoActivo.FUERA_DE_SERVICIO]: { label: 'Fuera de Servicio', variant: 'error' },
  [EstadoActivo.RESERVADO]:         { label: 'Reservado',         variant: 'primary' },
  [EstadoActivo.EN_TRANSITO]:       { label: 'En Tránsito',       variant: 'warning' },
  [EstadoActivo.PERDIDO]:           { label: 'Perdido',           variant: 'error' },
};

const calcDiasEnPosesion = (createdAt?: string): number => {
  if (!createdAt) return 0;
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
};

const ActivoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const { data: activo, isLoading } = useActivo(id);
  const { data: timeline, isLoading: isTimelineLoading } = useActivoTimeline(id);

  if (isLoading) return <div className="page-loader">Cargando detalles del activo...</div>;
  if (!activo) return <div className="page-error">No se encontró el activo solicitado.</div>;

  const statusCfg = STATUS_MAP[activo.estado as EstadoActivo] ?? { label: activo.estado, variant: 'secondary' as BadgeVariant };
  const diasPosesion = calcDiasEnPosesion(activo.createdAt);
  const specs = activo.modelo?.especificaciones ?? {};
  const hasSpecs = Object.keys(specs).length > 0;

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
            Editar
          </button>
        </div>
      </header>

      <div className="detail-layout">
        {/* Main column */}
        <div className="detail-main">
          <section className="card-premium main-info">
            <div className="info-header">
              <div className="title-group">
                <span className="asset-id">{activo.codigoInterno}</span>
                <h1>{activo.modelo?.nombre ?? '—'}</h1>
                {activo.numeroSerie && <p className="asset-serial">S/N: {activo.numeroSerie}</p>}
              </div>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Categoría</label>
                <span>{activo.modelo?.categoria?.nombre ?? '—'}</span>
              </div>
              <div className="info-item">
                <label>Modelo / Marca</label>
                <span>{activo.modelo?.nombre}{activo.modelo?.marca ? ` · ${activo.modelo.marca}` : ''}</span>
              </div>
              <div className="info-item">
                <label>Sucursal Actual</label>
                <div className="with-icon">
                  <MapPin size={14} />
                  <span>{activo.sucursal?.nombre ?? '—'}</span>
                </div>
              </div>
              <div className="info-item">
                <label>Última actualización</label>
                <div className="with-icon">
                  <Calendar size={14} />
                  <span>{activo.updatedAt ? new Date(activo.updatedAt).toLocaleDateString('es-AR') : '—'}</span>
                </div>
              </div>
              {activo.annoFabricacion && (
                <div className="info-item">
                  <label>Año de Fabricación</label>
                  <span>{activo.annoFabricacion}</span>
                </div>
              )}
              {activo.fechaAdquisicion && (
                <div className="info-item">
                  <label>Fecha de Adquisición</label>
                  <span>{new Date(activo.fechaAdquisicion).toLocaleDateString('es-AR')}</span>
                </div>
              )}
              {activo.valorAdquisicion != null && (
                <div className="info-item">
                  <label>Valor de Compra</label>
                  <div className="with-icon">
                    <DollarSign size={14} />
                    <span>{Number(activo.valorAdquisicion).toLocaleString('es-AR')} USD</span>
                  </div>
                </div>
              )}
              {activo.ubicacionActual && (
                <div className="info-item">
                  <label>Ubicación Actual</label>
                  <span>{activo.ubicacionActual}</span>
                </div>
              )}
            </div>

            {activo.notas && (
              <div className="notes-box">
                <label>Notas</label>
                <p>{activo.notas}</p>
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="timeline-section">
            <div className="section-header">
              <History size={20} />
              <h2>Historial de Movimientos</h2>
              {timeline && <span className="section-count">{timeline.length}</span>}
            </div>
            <AssetTimeline items={timeline} isLoading={isTimelineLoading} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          {/* Operational status */}
          <div className="card-premium status-card">
            <h3>Situación Operativa</h3>

            {activo.estado === EstadoActivo.EN_MANTENIMIENTO && (
              <div className="alert-box warning">
                <AlertTriangle size={20} />
                <div className="alert-content">
                  <strong>Mantenimiento en curso</strong>
                  <p>No puede ser reservado ni alquilado hasta su cierre.</p>
                </div>
              </div>
            )}

            {activo.estado === EstadoActivo.FUERA_DE_SERVICIO && (
              <div className="alert-box error">
                <AlertTriangle size={20} />
                <div className="alert-content">
                  <strong>Fuera de servicio</strong>
                  <p>Este equipo requiere atención antes de volver a operar.</p>
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
                <span>{diasPosesion} días</span>
              </div>
              <div className="op-stat">
                <label>Movimientos registrados</label>
                <span>{timeline?.length ?? '—'}</span>
              </div>
            </div>

            <div className="quick-actions">
              <button
                className="btn-action-outline"
                onClick={() => navigate(`/mantenimiento?activoId=${activo.id}`)}
              >
                <Wrench size={15} />
                Solicitar Mantenimiento
              </button>
              <button
                className="btn-action-outline"
                onClick={() => navigate(`/alquileres?activoId=${activo.id}`)}
              >
                <Tag size={15} />
                Ver Alquileres
              </button>
            </div>
          </div>

          {/* Technical specs from model */}
          <div className="card-premium data-card">
            <h3>Ficha Técnica</h3>
            {hasSpecs ? (
              <div className="technical-list">
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="tech-item">
                    <strong>{key}:</strong> {String(val)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="specs-empty">
                <Hash size={20} />
                <p>Sin especificaciones técnicas registradas en el modelo.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Editar Activo"
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
