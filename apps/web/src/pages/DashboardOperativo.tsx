import React from 'react';
import { 
  CheckCircle2, 
  Key, 
  AlertTriangle, 
  Wrench, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useAssetStats } from '../features/activos/hooks/useActivosData';
import { useNavigate } from 'react-router-dom';
import './DashboardOperativo.css';

const DashboardOperativo = () => {
  const { data: stats, isLoading } = useAssetStats();
  const navigate = useNavigate();

  const cards = [
    { 
      label: 'Disponibles', 
      value: stats?.disponible || 0, 
      icon: CheckCircle2, 
      color: 'var(--color-success)',
      onClick: () => navigate('/activos?estado=disponible')
    },
    { 
      label: 'Alquilados', 
      value: stats?.alquiler || 0, 
      icon: Key, 
      color: 'var(--color-info)',
      onClick: () => navigate('/activos?estado=alquiler')
    },
    { 
      label: 'En Mantenimiento', 
      value: stats?.mantenimiento || 0, 
      icon: Wrench, 
      color: 'var(--color-warning)',
      onClick: () => navigate('/activos?estado=mantenimiento')
    },
    { 
      label: 'Fuera de Servicio', 
      value: stats?.fuera_servicio || 0, 
      icon: AlertTriangle, 
      color: 'var(--color-error)',
      onClick: () => navigate('/activos?estado=fuera_servicio')
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <header className="page-header">
        <h1>Dashboard Operativo</h1>
        <p>Control centralizado de la disponibilidad y estado de la flota.</p>
      </header>

      <div className="stats-container">
        {cards.map((card, i) => (
          <div key={i} className="kpi-card card-premium" onClick={card.onClick}>
            <div className="kpi-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              <card.icon size={24} />
            </div>
            <div className="kpi-details">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">{isLoading ? '...' : card.value}</span>
            </div>
            <ArrowRight size={16} className="arrow-hover" />
          </div>
        ))}
      </div>

      <div className="dashboard-grids">
        <div className="card-premium grid-item">
          <h3>Próximas Devoluciones</h3>
          <div className="placeholder-state">
            <RotateCcw size={48} color="var(--color-surface-hover)" />
            <p>Monitoreo de equipos retornando por alquiler.</p>
          </div>
        </div>
        
        <div className="card-premium grid-item">
          <h3>Alertas Técnicas</h3>
          <div className="placeholder-state">
            <AlertTriangle size={48} color="var(--color-surface-hover)" />
            <p>Reporte de maquinaria con mantenimientos vencidos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOperativo;
