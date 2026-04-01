import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { label: 'Activos Totales', value: '124', icon: Package, color: 'var(--color-info)' },
    { label: 'En Alquiler', value: '42', icon: Calendar, color: 'var(--color-primary)' },
    { label: 'En Mantenimiento', value: '12', icon: AlertCircle, color: 'var(--color-error)' },
    { label: 'Clientes Activos', value: '86', icon: Users, color: 'var(--color-success)' },
  ];

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Dashboard General</h1>
        <p>Vista rápida del estado de la flota y operaciones.</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card card-premium">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <div className="card-premium activity-feed">
          <h3>Actividad Reciente</h3>
          <div className="placeholder-content">
            <TrendingUp size={48} color="var(--color-surface-hover)" />
            <p>No hay actividad reciente para mostrar.</p>
          </div>
        </div>
        
        <div className="card-premium quick-actions">
          <h3>Accesos Rápidos</h3>
          <div className="actions-list">
            <button className="btn-secondary">Nuevo Alquiler</button>
            <button className="btn-secondary">Registrar Activo</button>
            <button className="btn-secondary">Generar Reporte</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
