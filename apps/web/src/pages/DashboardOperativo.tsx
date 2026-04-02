import React from 'react';
import {
  CheckCircle2, Key, AlertTriangle, Wrench,
  RotateCcw, ArrowRight, Clock, Package,
} from 'lucide-react';
import { useAssetStats } from '../features/activos/hooks/useActivosData';
import { useAlquileresVencidos, useProximasDevolucioness } from '../features/alquileres/hooks/useAlquileresData';
import { useNavigate } from 'react-router-dom';
import './DashboardOperativo.css';

const DashboardOperativo = () => {
  const { data: stats, isLoading: loadingStats } = useAssetStats();
  const { data: vencidos = [], isLoading: loadingVencidos } = useAlquileresVencidos();
  const { data: proximas = [], isLoading: loadingProximas } = useProximasDevolucioness();
  const navigate = useNavigate();

  const cards = [
    { label: 'Disponibles',      value: stats?.disponible     ?? 0, icon: CheckCircle2, color: 'var(--color-success)', filter: 'disponible'       },
    { label: 'Alquilados',       value: stats?.alquiler       ?? 0, icon: Key,          color: 'var(--color-info)',    filter: 'alquilado'        },
    { label: 'En Mantenimiento', value: stats?.mantenimiento  ?? 0, icon: Wrench,       color: 'var(--color-warning)', filter: 'en_mantenimiento' },
    { label: 'Fuera de Servicio',value: stats?.fuera_servicio ?? 0, icon: AlertTriangle,color: 'var(--color-error)',   filter: 'fuera_de_servicio'},
  ];

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const diasRetraso = (iso: string) =>
    Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="dashboard-wrapper">
      <header className="page-header">
        <h1>Dashboard Operativo</h1>
        <p>Control centralizado de la disponibilidad y estado de la flota.</p>
      </header>

      <div className="stats-container">
        {cards.map((card) => (
          <div key={card.label} className="kpi-card card-premium" onClick={() => navigate(`/activos?estado=${card.filter}`)}>
            <div className="kpi-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              <card.icon size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">{loadingStats ? '...' : card.value}</span>
            </div>
            <ArrowRight size={16} className="arrow-hover" />
          </div>
        ))}
      </div>

      <div className="dashboard-grids">
        <div className="card-premium grid-item">
          <div className="grid-item-header">
            <h3>Próximas Devoluciones <span className="badge-count">{proximas.length}</span></h3>
            <button className="btn-link" onClick={() => navigate('/alquileres')}>Ver todas →</button>
          </div>
          {loadingProximas ? (
            <div className="placeholder-state"><Clock size={32} color="var(--color-surface-hover)" /><p>Cargando...</p></div>
          ) : proximas.length === 0 ? (
            <div className="placeholder-state">
              <RotateCcw size={40} color="var(--color-surface-hover)" />
              <p>No hay devoluciones en las próximas 48 hs.</p>
            </div>
          ) : (
            <ul className="devolucion-list">
              {proximas.slice(0, 5).map((a) => (
                <li key={a.id} className="devolucion-item" onClick={() => navigate(`/alquileres/${a.id}`)}>
                  <div className="devolucion-cliente">{a.cliente?.nombre ?? '—'}</div>
                  <div className="devolucion-fecha"><Clock size={12} />{fmt(a.fechaFinPrevista)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-premium grid-item">
          <div className="grid-item-header">
            <h3>Alquileres Vencidos <span className="badge-count badge-count--error">{vencidos.length}</span></h3>
            <button className="btn-link" onClick={() => navigate('/alquileres')}>Ver todos →</button>
          </div>
          {loadingVencidos ? (
            <div className="placeholder-state"><AlertTriangle size={32} color="var(--color-surface-hover)" /><p>Cargando...</p></div>
          ) : vencidos.length === 0 ? (
            <div className="placeholder-state">
              <CheckCircle2 size={40} color="var(--color-success)" />
              <p>Sin alquileres vencidos. ¡Todo en orden!</p>
            </div>
          ) : (
            <ul className="devolucion-list">
              {vencidos.slice(0, 5).map((a) => (
                <li key={a.id} className="devolucion-item devolucion-item--alert" onClick={() => navigate(`/alquileres/${a.id}`)}>
                  <div className="devolucion-cliente">{a.cliente?.nombre ?? '—'}</div>
                  <div className="devolucion-fecha devolucion-fecha--error">
                    <AlertTriangle size={12} />{diasRetraso(a.fechaFinPrevista)}d de retraso
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card-premium totales-card">
        <Package size={18} color="var(--color-text-secondary)" />
        <span>Total de activos registrados: <strong>{loadingStats ? '...' : stats?.total ?? 0}</strong></span>
      </div>
    </div>
  );
};

export default DashboardOperativo;
