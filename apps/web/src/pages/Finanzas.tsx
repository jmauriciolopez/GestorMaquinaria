import React, { useState } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useFinanceStats } from '../features/finanzas/hooks/usePagosData';
import { Pago, MetodoPago } from '../features/finanzas/types';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import './Finanzas.css';

const METODO_CFG: Record<MetodoPago, { label: string; variant: BadgeVariant }> = {
  [MetodoPago.EFECTIVO]:      { label: 'Efectivo',      variant: 'success'   },
  [MetodoPago.TRANSFERENCIA]: { label: 'Transferencia', variant: 'info'      },
  [MetodoPago.TARJETA]:       { label: 'Tarjeta',       variant: 'primary'   },
  [MetodoPago.CHEQUE]:        { label: 'Cheque',        variant: 'warning'   },
  [MetodoPago.OTRO]:          { label: 'Otro',          variant: 'secondary' },
};

interface PagoExtended extends Pago {
  alquiler?: { id: string; cliente?: { nombre: string } };
}

const usePagosRecientes = () => useQuery<PagoExtended[]>({
  queryKey: ['pagos', 'recientes'],
  queryFn: async () => {
    // Obtenemos alquileres activos y sus pagos
    const { data: alqData } = await api.get('/alquileres', { params: { limit: 50 } });
    const alquileres = alqData?.data ?? alqData ?? [];
    const pagos: PagoExtended[] = [];
    for (const a of alquileres.slice(0, 20)) {
      try {
        const { data: pData } = await api.get(`/pagos/alquiler/${a.id}`);
        const items = pData?.data ?? pData ?? [];
        items.forEach((p: Pago) => pagos.push({ ...p, alquiler: a }));
      } catch { /* skip */ }
    }
    return pagos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },
  staleTime: 60_000,
});

const Finanzas: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loadingStats } = useFinanceStats();
  const { data: pagos = [], isLoading: loadingPagos } = usePagosRecientes();
  const [filtroMetodo, setFiltroMetodo] = useState('');

  const filtered = filtroMetodo ? pagos.filter(p => p.metodoPago === filtroMetodo) : pagos;

  const totalFiltrado = filtered.reduce((acc, p) => acc + Number(p.monto), 0);

  const columns = [
    { header: 'Fecha',    accessor: (p: PagoExtended) => new Date(p.fecha).toLocaleDateString('es-AR') },
    { header: 'Cliente',  accessor: (p: PagoExtended) => <strong>{p.alquiler?.cliente?.nombre ?? '—'}</strong> },
    { header: 'Alquiler', accessor: (p: PagoExtended) => (
      <button className="link-btn" onClick={e => { e.stopPropagation(); navigate(`/alquileres/${p.alquilerId}`); }}>
        #{p.alquilerId.slice(0,8)}
      </button>
    )},
    { header: 'Método',   accessor: (p: PagoExtended) => {
      const cfg = METODO_CFG[p.metodoPago] ?? { label: p.metodoPago, variant: 'secondary' as BadgeVariant };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { header: 'Referencia', accessor: (p: PagoExtended) => <span className="text-muted">{p.referencia ?? '—'}</span> },
    { header: 'Monto',    accessor: (p: PagoExtended) => (
      <strong style={{ color: 'var(--color-success)' }}>USD {Number(p.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
    )},
  ];

  return (
    <div className="finanzas-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Módulo de Finanzas</h1>
          <p>Control de cobros, saldos e ingresos.</p>
        </div>
      </header>

      {/* KPI cards */}
      <div className="fin-kpi-grid">
        <div className="fin-kpi-card fin-kpi-green">
          <DollarSign size={22} />
          <div>
            <span className="fin-kpi-value">
              {loadingStats ? '...' : `USD ${Number(stats?.totalCobrado ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="fin-kpi-label">Total Cobrado</span>
          </div>
        </div>
        <div className="fin-kpi-card fin-kpi-blue">
          <CreditCard size={22} />
          <div>
            <span className="fin-kpi-value">{loadingPagos ? '...' : pagos.length}</span>
            <span className="fin-kpi-label">Transacciones</span>
          </div>
        </div>
        <div className="fin-kpi-card fin-kpi-purple">
          <TrendingUp size={22} />
          <div>
            <span className="fin-kpi-value">
              {loadingPagos ? '...' : `USD ${(pagos.length ? pagos.reduce((a,p) => a + Number(p.monto), 0) / pagos.length : 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="fin-kpi-label">Ticket Promedio</span>
          </div>
        </div>
        <div className="fin-kpi-card fin-kpi-orange">
          <Wallet size={22} />
          <div>
            <span className="fin-kpi-value">
              {loadingPagos ? '...' : `USD ${totalFiltrado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="fin-kpi-label">{filtroMetodo ? `Total (${filtroMetodo})` : 'Total Visible'}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar card-premium">
        <div className="select-wrapper">
          <Filter size={14} />
          <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)}>
            <option value="">Todos los métodos</option>
            {Object.entries(METODO_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <span className="fin-count">{filtered.length} transacciones</span>
      </div>

      <DataTable columns={columns as any} data={filtered} isLoading={loadingPagos} />
    </div>
  );
};

export default Finanzas;
