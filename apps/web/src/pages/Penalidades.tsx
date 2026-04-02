import React, { useState } from 'react';
import { AlertTriangle, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import './Penalidades.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type TipoPen   = 'retraso' | 'danio' | 'faltante' | 'horas_extra' | 'otro';
type EstadoPen = 'pendiente' | 'aprobada' | 'anulada' | 'pagada';

interface Penalidad {
  id: string;
  alquilerId: string;
  tipo: TipoPen;
  estado: EstadoPen;
  descripcion?: string;
  monto: number;
  montoOverride?: number;
  createdAt: string;
  alquiler?: { id: string; cliente?: { nombre: string } };
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TIPO_CFG: Record<TipoPen, { label: string; variant: BadgeVariant }> = {
  retraso:     { label: 'Retraso',     variant: 'warning'   },
  danio:       { label: 'Daño',        variant: 'error'     },
  faltante:    { label: 'Faltante',    variant: 'error'     },
  horas_extra: { label: 'Hs. Extra',   variant: 'info'      },
  otro:        { label: 'Otro',        variant: 'secondary' },
};

const ESTADO_CFG: Record<EstadoPen, { label: string; variant: BadgeVariant }> = {
  pendiente: { label: 'Pendiente', variant: 'warning'   },
  aprobada:  { label: 'Aprobada',  variant: 'success'   },
  anulada:   { label: 'Anulada',   variant: 'secondary' },
  pagada:    { label: 'Pagada',    variant: 'info'      },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
const usePenalidadesGlobal = () => useQuery<Penalidad[]>({
  queryKey: ['penalidades', 'global'],
  queryFn: async () => {
    // Obtenemos alquileres y sus penalidades
    const { data: alqData } = await api.get('/alquileres', { params: { limit: 100 } });
    const alquileres = alqData?.data ?? alqData ?? [];
    const result: Penalidad[] = [];
    for (const a of alquileres.slice(0, 30)) {
      try {
        const { data } = await api.get(`/penalidades/alquiler/${a.id}`);
        const items = data?.data ?? data ?? [];
        items.forEach((p: Penalidad) => result.push({ ...p, alquiler: a }));
      } catch { /* skip */ }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  staleTime: 60_000,
});

// ─── Main page ────────────────────────────────────────────────────────────────
const Penalidades = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { data: penalidades = [], isLoading } = usePenalidadesGlobal();
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: EstadoPen }) =>
      api.patch(`/penalidades/${id}/estado`, { estado }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['penalidades'] }); success('Estado actualizado'); },
    onError: () => error('Error al actualizar'),
  });

  const filtered = penalidades
    .filter(p => !filtroEstado || p.estado === filtroEstado)
    .filter(p => !filtroTipo   || p.tipo   === filtroTipo);

  const totalPendiente = penalidades
    .filter(p => p.estado === 'pendiente' || p.estado === 'aprobada')
    .reduce((acc, p) => acc + Number(p.montoOverride ?? p.monto), 0);

  const columns = [
    { header: 'Fecha',    accessor: (p: Penalidad) => new Date(p.createdAt).toLocaleDateString('es-AR') },
    { header: 'Cliente',  accessor: (p: Penalidad) => <strong>{p.alquiler?.cliente?.nombre ?? '—'}</strong> },
    { header: 'Alquiler', accessor: (p: Penalidad) => (
      <button className="link-btn" onClick={e => { e.stopPropagation(); navigate(`/alquileres/${p.alquilerId}`); }}>
        #{p.alquilerId.slice(0,8)}
      </button>
    )},
    { header: 'Tipo',     accessor: (p: Penalidad) => {
      const cfg = TIPO_CFG[p.tipo] ?? { label: p.tipo, variant: 'secondary' as BadgeVariant };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { header: 'Estado',   accessor: (p: Penalidad) => {
      const cfg = ESTADO_CFG[p.estado] ?? { label: p.estado, variant: 'secondary' as BadgeVariant };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { header: 'Monto',    accessor: (p: Penalidad) => (
      <strong style={{ color: 'var(--color-error)' }}>
        USD {Number(p.montoOverride ?? p.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </strong>
    )},
    { header: 'Acciones', accessor: (p: Penalidad) => (
      <div className="actions-cell" onClick={e => e.stopPropagation()}>
        {p.estado === 'pendiente' && (
          <>
            <button className="icon-btn" title="Aprobar"
              onClick={() => cambiarEstado.mutate({ id: p.id, estado: 'aprobada' })}>
              <CheckCircle size={15} style={{ color: 'var(--color-success)' }} />
            </button>
            <button className="icon-btn" title="Anular"
              onClick={() => cambiarEstado.mutate({ id: p.id, estado: 'anulada' })}>
              <XCircle size={15} style={{ color: 'var(--color-error)' }} />
            </button>
          </>
        )}
        <button className="icon-btn" title="Ver alquiler"
          onClick={() => navigate(`/alquileres/${p.alquilerId}`)}>
          <Eye size={15} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="penalidades-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Gestión de Penalidades</h1>
          <p>Multas por retraso, daños o mal uso de maquinaria.</p>
        </div>
      </header>

      {/* Summary */}
      <div className="pen-summary-grid">
        <div className="pen-summary-card pen-card-error">
          <AlertTriangle size={20} />
          <div>
            <span className="pen-card-value">{penalidades.filter(p => p.estado === 'pendiente').length}</span>
            <span className="pen-card-label">Pendientes</span>
          </div>
        </div>
        <div className="pen-summary-card pen-card-warning">
          <AlertTriangle size={20} />
          <div>
            <span className="pen-card-value">USD {totalPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            <span className="pen-card-label">Monto a cobrar</span>
          </div>
        </div>
        <div className="pen-summary-card pen-card-success">
          <CheckCircle size={20} />
          <div>
            <span className="pen-card-value">{penalidades.filter(p => p.estado === 'pagada').length}</span>
            <span className="pen-card-label">Pagadas</span>
          </div>
        </div>
      </div>

      <div className="filters-bar card-premium">
        <div className="select-wrapper">
          <Filter size={14} />
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="select-wrapper">
          <Filter size={14} />
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {Object.entries(TIPO_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <span className="pen-count">{filtered.length} registros</span>
      </div>

      <DataTable columns={columns as any} data={filtered} isLoading={isLoading} />
    </div>
  );
};

export default Penalidades;
