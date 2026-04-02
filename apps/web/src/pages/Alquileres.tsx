import React, { useState } from 'react';
import { Plus, Filter, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlquileres } from '../features/alquileres/hooks/useAlquileresData';
import { Alquiler, EstadoAlquiler } from '../features/alquileres/types';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import { NuevoAlquilerWizard } from '../features/alquileres/components/NuevoAlquilerWizard';
import './Alquileres.css';

const estadoBadge: Record<EstadoAlquiler, { label: string; variant: BadgeVariant }> = {
  [EstadoAlquiler.BORRADOR]:         { label: 'Borrador',      variant: 'secondary' },
  [EstadoAlquiler.CONFIRMADO]:       { label: 'Confirmado',    variant: 'primary'   },
  [EstadoAlquiler.ENTREGADO]:        { label: 'Entregado',     variant: 'info'      },
  [EstadoAlquiler.DEVUELTO_PARCIAL]: { label: 'Dev. Parcial',  variant: 'warning'   },
  [EstadoAlquiler.DEVUELTO]:         { label: 'Devuelto',      variant: 'success'   },
  [EstadoAlquiler.CANCELADO]:        { label: 'Cancelado',     variant: 'error'     },
  [EstadoAlquiler.FINALIZADO]:       { label: 'Finalizado',    variant: 'success'   },
};

const Alquileres = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});
  const { data, isLoading } = useAlquileres(params);
  const alquileres: Alquiler[] = (data as any)?.data ?? (data as any) ?? [];

  const columns = [
    { header: '#',       accessor: (a: Alquiler) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.id.slice(0, 8)}</span> },
    { header: 'Cliente', accessor: (a: Alquiler) => <strong>{a.cliente?.nombre ?? '—'}</strong> },
    { header: 'Estado',  accessor: (a: Alquiler) => {
      const cfg = estadoBadge[a.estado] ?? { label: a.estado, variant: 'secondary' as BadgeVariant };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { header: 'Equipos', accessor: (a: Alquiler) => a.items?.length ?? 0 },
    { header: 'Inicio',  accessor: (a: Alquiler) => new Date(a.fechaInicio).toLocaleDateString('es-AR') },
    { header: 'Vence',   accessor: (a: Alquiler) => {
      const vencido = new Date(a.fechaFinPrevista) < new Date() && a.estado === EstadoAlquiler.ENTREGADO;
      return <span style={{ color: vencido ? '#ef4444' : 'inherit' }}>{new Date(a.fechaFinPrevista).toLocaleDateString('es-AR')}</span>;
    }},
    { header: 'Total',   accessor: (a: Alquiler) => `$${Number(a.subtotal).toFixed(2)}` },
    { header: '',        accessor: (a: Alquiler) => (
      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); navigate(`/alquileres/${a.id}`); }}>
        <Eye size={16} />
      </button>
    )},
  ];

  return (
    <div className="alquileres-wrapper">
      <header className="page-header">
        <div><h1>Alquileres</h1><p>Gestión de contratos, entregas y devoluciones.</p></div>
        <button className="btn-primary" onClick={() => setDrawerOpen(true)}>
          <Plus size={16} /> Nuevo Alquiler
        </button>
      </header>

      <div className="filters-bar card-premium">
        <div className="select-wrapper">
          <Filter size={14} />
          <select value={params.estado ?? ''} onChange={(e) => setParams(e.target.value ? { estado: e.target.value } : {})}>
            <option value="">Todos los estados</option>
            {Object.entries(estadoBadge).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={columns as any} data={alquileres} isLoading={isLoading}
        onRowClick={(a: Alquiler) => navigate(`/alquileres/${a.id}`)} />

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nuevo Alquiler">
        <NuevoAlquilerWizard
          onSuccess={(id) => { setDrawerOpen(false); if (id) navigate(`/alquileres/${id}`); }}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};

export default Alquileres;
