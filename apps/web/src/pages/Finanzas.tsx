import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { useFinanceStats } from '../features/finanzas/hooks/usePagosData';
import './Alquileres.css'; // Reusing some base styles for consistent layout

const Finanzas: React.FC = () => {
  const { data: stats, isLoading } = useFinanceStats();

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-left">
          <h1>Módulo de Finanzas</h1>
          <p>Control de cobros, saldos e ingresos de la sucursal.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={18} />
            Exportar Reporte
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="stat-card card-premium">
          <div className="stat-header">
            <div className="stat-icon income">
              <DollarSign size={24} />
            </div>
            <span className="stat-label">Total Cobrado (MTD)</span>
          </div>
          <div className="stat-value">
            {isLoading ? '...' : `USD ${stats?.totalCobrado.toLocaleString()}`}
          </div>
          <div className="stat-footer success">
            <ArrowUpRight size={16} />
            <span>+12.5% vs mes anterior</span>
          </div>
        </div>

        <div className="stat-card card-premium">
          <div className="stat-header">
            <div className="stat-icon debt">
              <Wallet size={24} />
            </div>
            <span className="stat-label">Saldos Pendientes</span>
          </div>
          <div className="stat-value">USD 4,250.00</div>
          <div className="stat-footer danger">
            <TrendingUp size={16} />
            <span>8 contratos próximos a vencer</span>
          </div>
        </div>

        <div className="stat-card card-premium">
          <div className="stat-header">
            <div className="stat-icon info">
              <Calendar size={24} />
            </div>
            <span className="stat-label">Ingresos Proyectados</span>
          </div>
          <div className="stat-value">USD 12,800.00</div>
          <div className="stat-footer info">
            <span>Estimado para fin de mes</span>
          </div>
        </div>
      </div>

      <section className="section-container">
        <div className="section-header">
          <div className="title-group">
            <Filter size={18} />
            <h2>Flujo de Caja Reciente</h2>
          </div>
        </div>

        <div className="card-premium" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-section)' }}>
          <div className="empty-state">
            <TrendingUp size={48} color="var(--text-muted)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              El listado consolidado de transacciones estará disponible en la próxima actualización.
              <br />
              Por ahora, puede ver los cobros individuales dentro de cada <strong>detalle de alquiler</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Finanzas;
