import React, { useState } from 'react';
import { RotateCcw, Eye, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlquileres } from '../features/alquileres/hooks/useAlquileresData';
import { Alquiler, EstadoAlquiler } from '../features/alquileres/types';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import './Devoluciones.css';

const ESTADOS_PENDIENTES: EstadoAlquiler[] = [
  EstadoAlquiler.ENTREGADO,
  EstadoAlquiler.DEVUELTO_PARCIAL,
];

const estadoBadge: Record<string, { label: string; variant: BadgeVariant }> = {
  entregado:        { label: 'Entregado',    variant: 'info'    },
  devuelto_parcial: { label: 'Dev. Parcial', variant: 'warning' },
  devuelto:         { label: 'Devuelto',     variant: 'success' },
  finalizado:       { label: 'Finalizado',   variant: 'success' },
};

const Devoluciones = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<'pendientes' | 'todos'>('pendientes');

  const { data: resultEntregado, isLoading: l1 } = useAlquileres({ estado: 'entregado' });
  const { data: resultParcial,   isLoading: l2 } = useAlquileres({ estado: 'devuelto_parcial' });
  const { data: resultTodos,     isLoading: l3 } = useAlquileres({});

  const entregados: Alquiler[] = resultEntregado?.data ?? resultEntregado ?? [];
  const parciales:  Alquiler[] = resultParcial?.data   ?? resultParcial   ?? [];
  const todos:      Alquiler[] = resultTodos?.data      ?? resultTodos     ?? [];

  const pendientes = [...entregados, ...parciales].sort(
    (a, b) => new Date(a.fechaFinPrevista).getTime() - new Date(b.fechaFinPrevista).getTime()
  );

  const data = filtro === 'pendientes' ? pendientes : todos;
  const isLoading = filtro === 'pendientes' ? (l1 || l2) : l3;

  const ahora = new Date();
  const vencidos = pendientes.filter(a => new Date(a.fechaFinPrevista) < ahora).length;

  const columns = [
    { header: '#',       accessor: (a: Alquiler) => <span className="mono">{a.id.slice(0,8)}</span> },
    { header: 'Cliente', accessor: (a: Alquiler) => <strong>{a.cliente?.nombre ?? '—'}</strong> },
    { header: 'Estado',  accessor: (a: Alquiler) => {
      const cfg = estadoBadge[a.estado] ?? { label: a.estado, variant: 'secondary' as BadgeVariant };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { header: 'Equipos', accessor: (a: Alquiler) => a.items?.length ?? 0 },
    { header: 'Vence',   accessor: (a: Alquiler) => {
      const vencido = new Date(a.fechaFinPrevista) < ahora && ESTADOS_PENDIENTES.includes(a.estado);
      return (
        <span style={{ color: vencido ? '#ef4444' : 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {vencido && <AlertTriangle size={13} />}
          {new Date(a.fechaFinPrevista).toLocaleDateString('es-AR')}
        </span>
      );
    }},
    { header: '', accessor: (a: Alquiler) => (
      <button className="icon-btn" onClick={e => { e.stopPropagation(); navigate(`/alquileres/${a.id}`); }} title="Ver alquiler">
        <Eye size={16} />
      </button>
    )},
  ];

  return (
    <div className="devoluciones-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Retornos y Devoluciones</h1>
          <p>Seguimiento de check-ins pendientes y estado de equipos en campo.</p>
        </div>
      </header>

      {/* Summary cards */}
      <div className="dev-summary-grid">
        <div className="dev-summary-card dev-card-warning">
          <AlertTriangle size={20} />
          <div>
            <span className="dev-card-value">{vencidos}</span>
            <span className="dev-card-label">Vencidos</span>
          </div>
        </div>
        <div className="dev-summary-card dev-card-info">
          <RotateCcw size={20} />
          <div>
            <span className="dev-card-value">{entregados.length}</span>
            <span className="dev-card-label">En campo</span>
          </div>
        </div>
        <div className="dev-summary-card dev-card-primary">
          <CheckCircle size={20} />
          <div>
            <span className="dev-card-value">{parciales.length}</span>
            <span className="dev-card-label">Dev. parcial</span>
          </div>
        </div>
      </div>

      <div className="filters-bar card-premium">
        <div className="dev-filter-tabs">
          <button className={`dev-tab ${filtro === 'pendientes' ? 'active' : ''}`} onClick={() => setFiltro('pendientes')}>
            Pendientes ({pendientes.length})
          </button>
          <button className={`dev-tab ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>
            Todos
          </button>
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={data}
        isLoading={isLoading}
        onRowClick={(a: Alquiler) => navigate(`/alquileres/${a.id}`)}
      />
    </div>
  );
};

export default Devoluciones;
