import React, { useState } from 'react';
import { Plus, Search, MapPin, Eye, Edit3, Trash2, Filter, Package, Wrench, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useActivos,
  useDeleteActivo,
  useAssetStats,
  useCategorias,
} from '../features/activos/hooks/useActivosData';
import { Activo, EstadoActivo } from '../features/activos/types';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import AssetForm from '../features/activos/components/AssetForm';
import './Activos.css';

const STATUS_MAP: Record<EstadoActivo, { label: string; variant: BadgeVariant }> = {
  [EstadoActivo.DISPONIBLE]:        { label: 'Disponible',      variant: 'success' },
  [EstadoActivo.ALQUILADO]:         { label: 'Alquilado',       variant: 'info' },
  [EstadoActivo.EN_MANTENIMIENTO]:  { label: 'Mantenimiento',   variant: 'warning' },
  [EstadoActivo.FUERA_DE_SERVICIO]: { label: 'Fuera de Servicio', variant: 'error' },
  [EstadoActivo.RESERVADO]:         { label: 'Reservado',       variant: 'primary' },
  [EstadoActivo.EN_TRANSITO]:       { label: 'En Tránsito',     variant: 'warning' },
  [EstadoActivo.PERDIDO]:           { label: 'Perdido',         variant: 'error' },
};

const PAGE_SIZE = 20;

const Activos = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ busqueda: '', estado: '', categoriaId: '' });

  const params = {
    ...(filters.busqueda   && { busqueda: filters.busqueda }),
    ...(filters.estado     && { estado: filters.estado }),
    ...(filters.categoriaId && { categoriaId: filters.categoriaId }),
    page,
    limit: PAGE_SIZE,
  };

  const { data: result, isLoading } = useActivos(params);
  const { data: stats } = useAssetStats();
  const { data: categorias } = useCategorias();
  const deleteActivo = useDeleteActivo();

  const items: Activo[] = result?.data ?? result ?? [];
  const total: number = result?.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleFilterChange = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const handleEdit = (activo: Activo) => {
    setSelectedActivo(activo);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedActivo(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (activo: Activo) => {
    if (!window.confirm(`¿Eliminar el activo ${activo.codigoInterno}? Esta acción no se puede deshacer.`)) return;
    await deleteActivo.mutateAsync(activo.id);
  };

  const columns = [
    {
      header: 'Código',
      accessor: (a: Activo) => (
        <div className="codigo-cell">
          <strong>{a.codigoInterno}</strong>
          {a.numeroSerie && <span>{a.numeroSerie}</span>}
        </div>
      ),
    },
    {
      header: 'Equipo / Modelo',
      accessor: (a: Activo) => (
        <div className="model-cell">
          <span>{a.modelo?.nombre ?? '—'}</span>
          <small>{a.modelo?.categoria?.nombre}</small>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (a: Activo) => {
        const cfg = STATUS_MAP[a.estado] ?? { label: a.estado, variant: 'secondary' as BadgeVariant };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      header: 'Ubicación',
      accessor: (a: Activo) => (
        <div className="location-cell">
          <MapPin size={14} />
          <span>{a.sucursal?.nombre ?? '—'}</span>
        </div>
      ),
    },
    {
      header: 'Acciones',
      accessor: (a: Activo) => (
        <div className="actions-cell" onClick={e => e.stopPropagation()}>
          <button className="icon-btn" onClick={() => navigate(`/activos/${a.id}`)} title="Ver Detalle">
            <Eye size={16} />
          </button>
          <button className="icon-btn" onClick={() => handleEdit(a)} title="Editar">
            <Edit3 size={16} />
          </button>
          <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(a)} title="Eliminar">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="activos-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Gestión de Activos</h1>
          <p>Control total sobre la flota de maquinaria y equipos.</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={18} />
          Nuevo Activo
        </button>
      </header>

      {/* Stats cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-success">
            <CheckCircle size={20} />
            <div>
              <span className="stat-value">{stats.disponible}</span>
              <span className="stat-label">Disponibles</span>
            </div>
          </div>
          <div className="stat-card stat-info">
            <Package size={20} />
            <div>
              <span className="stat-value">{stats.alquiler}</span>
              <span className="stat-label">Alquilados</span>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <Wrench size={20} />
            <div>
              <span className="stat-value">{stats.mantenimiento}</span>
              <span className="stat-label">En Mantenimiento</span>
            </div>
          </div>
          <div className="stat-card stat-error">
            <AlertTriangle size={20} />
            <div>
              <span className="stat-value">{stats.fuera_servicio}</span>
              <span className="stat-label">Fuera de Servicio</span>
            </div>
          </div>
          <div className="stat-card stat-total">
            <Package size={20} />
            <div>
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Flota</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar card-premium">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por código o serie..."
            value={filters.busqueda}
            onChange={e => handleFilterChange('busqueda', e.target.value)}
          />
        </div>
        <div className="select-filters">
          <div className="select-wrapper">
            <Filter size={16} />
            <select value={filters.estado} onChange={e => handleFilterChange('estado', e.target.value)}>
              <option value="">Todos los estados</option>
              {Object.values(EstadoActivo).map(e => (
                <option key={e} value={e}>{STATUS_MAP[e]?.label ?? e}</option>
              ))}
            </select>
          </div>
          <div className="select-wrapper">
            <Filter size={16} />
            <select value={filters.categoriaId} onChange={e => handleFilterChange('categoriaId', e.target.value)}>
              <option value="">Todas las categorías</option>
              {(categorias ?? []).map((c: { id: string; nombre: string }) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={items}
        isLoading={isLoading}
        onRowClick={(a: Activo) => navigate(`/activos/${a.id}`)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <span className="pagination-info">
            Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} de {total}
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                  : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p as number)}>{p}</button>
              )}
            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedActivo ? 'Editar Activo' : 'Registrar Nuevo Activo'}
      >
        <AssetForm
          initialData={selectedActivo}
          onCancel={() => setDrawerOpen(false)}
          onSuccess={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};

export default Activos;
