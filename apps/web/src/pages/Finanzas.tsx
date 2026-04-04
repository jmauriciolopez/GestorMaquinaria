import React, { useState } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePagos, useFinanceStats } from '../features/finanzas/hooks/usePagosData';
import { Pago, MetodoPago } from '../features/finanzas/types';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import './Finanzas.css';

const METODO_CFG: Record<string, { label: string; variant: BadgeVariant }> = {
  [MetodoPago.EFECTIVO]:      { label: 'Efectivo',      variant: 'success'   },
  [MetodoPago.TRANSFERENCIA]: { label: 'Transferencia', variant: 'info'      },
  [MetodoPago.TARJETA]:       { label: 'Tarjeta',       variant: 'primary'   },
  [MetodoPago.CHEQUE]:        { label: 'Cheque',        variant: 'warning'   },
  [MetodoPago.MERCADOPAGO]:   { label: 'MercadoPago',   variant: 'info'      },
  [MetodoPago.OTRO]:          { label: 'Otro',          variant: 'secondary' },
};

const Finanzas: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loadingStats } = useFinanceStats();
  const { data: pagos = [], isLoading: loadingPagos } = usePagos(200);
  const [filtroMetodo, setFiltroMetodo] = useState('');

  const filtered = filtroMetodo ? pagos.filter(p => p.metodoPago === filtroMetodo) : pagos;
  const totalFiltrado = filtered.reduce((acc, p) => acc + Number(p.monto), 0);

  const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2 });

  const columns = [
    {
      header: 'Fecha',
      accessor: (p: Pago) => new Date(p.fecha).toLocaleDateString('es-AR'),
    },
    {
      header: 'Cliente',
      accessor: (p: Pago) => (
        <strong>{(p as any).alquiler?.cliente?.nombre ?? '—'}</strong>
      ),
    },
    {
      header: 'Alquiler',
      accessor: (p: Pago) => (
        <button
          className="link-btn"
          onClick={e => { e.stopPropagation(); navigate(`/alquileres/${p.alquilerId}`); }}
        >
          #{p.alquilerId.slice(0, 8)}
        </button>
      ),
    },
    {
      header: 'Método',
      accessor: (p: Pago) => {
        const cfg = METODO_CFG[p.metodoPago] ?? { label: p.metodoPago, variant: 'secondary' as BadgeVariant };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      header: 'Referencia',
      accessor: (p: Pago) => {
        const ref = p.referencia ?? (p.mpStatus ? `MP: ${p.mpStatus}` : '—');
        return <span className="text-muted">{ref}</span>;
      },
    },
    {
      header: 'Monto',
      accessor: (p: Pago) => (
        <strong style={{ color: 'var(--color-success)' }}>
          ${fmt(Number(p.monto))}
        </strong>
      ),
    },
  ];

  return (
    <div className="finanzas-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Módulo de Finanzas</h1>
          <p>Control de cobros, saldos e ingresos.</p>
        </div>
      </header>

      <div className="fin-kpi-grid">
        <div className="fin-kpi-card fin-kpi-green">
          <DollarSign size={22} />
          <div>
            <span className="fin-kpi-value">
              {loadingStats ? '...' : `$${fmt(stats?.totalCobrado ?? 0)}`}
            </span>
            <span className="fin-kpi-label">Total Cobrado</span>
          </div>
        </div>
        <div className="fin-kpi-card fin-kpi-blue">
          <CreditCard size={22} />
          <div>
            <span className="fin-kpi-value">
              {loadingStats ? '...' : stats?.totalTransacciones ?? 0}
            </span>
            <span className="fin-kpi-label">Transacciones</span>
          </div>
        </div>
        <div className="fin-kpi-card fin-kpi-purple">
          <TrendingUp size={22} />
          <div>
            <span className="fin-kpi-value">
              {loadingStats ? '...' : `$${fmt(stats?.ticketPromedio ?? 0)}`}
            </span>
            <span className="fin-kpi-label">Ticket Promedio</span>
          </div>
        </div>
        <div className="fin-kpi-card fin-kpi-orange">
          <Wallet size={22} />
          <div>
            <span className="fin-kpi-value">
              {loadingPagos ? '...' : `$${fmt(totalFiltrado)}`}
            </span>
            <span className="fin-kpi-label">
              {filtroMetodo ? `Total (${METODO_CFG[filtroMetodo]?.label})` : 'Total visible'}
            </span>
          </div>
        </div>
      </div>

      <div className="filters-bar card-premium">
        <div className="select-wrapper">
          <Filter size={14} />
          <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)}>
            <option value="">Todos los métodos</option>
            {Object.entries(METODO_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <span className="fin-count">{filtered.length} transacciones</span>
      </div>

      <DataTable columns={columns as any} data={filtered} isLoading={loadingPagos} />
    </div>
  );
};

export default Finanzas;
