import React, { useState } from 'react';
import { Plus, Wrench, Play, CheckCircle, Eye, Filter, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../api/client';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import { useToast } from '../context/ToastContext';
import { useActivos } from '../features/activos/hooks/useActivosData';
import './Mantenimiento.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type EstadoMant = 'programado' | 'en_curso' | 'completado' | 'cancelado';
type TipoMant   = 'preventivo' | 'correctivo';

interface Mantenimiento {
  id: string;
  activoId: string;
  tipo: TipoMant;
  estado: EstadoMant;
  titulo: string;
  descripcion?: string;
  diagnostico?: string;
  tareasRealizadas?: string;
  costoTotal?: number;
  fechaProgramada?: string;
  fechaInicio?: string;
  fechaCierre?: string;
  createdAt: string;
  activo?: { codigoInterno: string; modelo?: { nombre: string } };
  ordenesTrabajo?: { id: string; descripcion: string; estado: string }[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
const useMantenimientos = () => useQuery<Mantenimiento[]>({
  queryKey: ['mantenimientos'],
  queryFn: async () => { const { data } = await api.get('/mantenimientos'); return data?.data ?? data ?? []; },
});

const useMantenimiento = (id?: string) => useQuery<Mantenimiento>({
  queryKey: ['mantenimientos', id],
  queryFn: async () => { const { data } = await api.get(`/mantenimientos/${id}`); return data?.data ?? data; },
  enabled: !!id,
});

// ─── Status config ────────────────────────────────────────────────────────────
const ESTADO_CFG: Record<EstadoMant, { label: string; variant: BadgeVariant }> = {
  programado:  { label: 'Programado',  variant: 'primary'   },
  en_curso:    { label: 'En Curso',    variant: 'warning'   },
  completado:  { label: 'Completado',  variant: 'success'   },
  cancelado:   { label: 'Cancelado',   variant: 'error'     },
};

// ─── Create form ──────────────────────────────────────────────────────────────
interface CreateFormProps { onSuccess: () => void; onCancel: () => void; }
const CreateForm: React.FC<CreateFormProps> = ({ onSuccess, onCancel }) => {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { data: activosResult } = useActivos({ limit: 200 });
  const activos = activosResult?.data ?? activosResult ?? [];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{
    activoId: string; tipo: TipoMant; titulo: string; descripcion?: string; fechaProgramada?: string;
  }>();

  const create = useMutation({
    mutationFn: async (dto: object) => { const { data } = await api.post('/mantenimientos', dto); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mantenimientos'] }); success('Mantenimiento programado'); onSuccess(); },
    onError: () => error('Error al crear el mantenimiento'),
  });

  return (
    <form className="mant-form" onSubmit={handleSubmit(v => create.mutate(v))}>
      <div className="form-group">
        <label>Activo *</label>
        <select {...register('activoId', { required: 'Requerido' })} className={errors.activoId ? 'error' : ''}>
          <option value="">Seleccionar activo...</option>
          {activos.map((a: any) => (
            <option key={a.id} value={a.id}>{a.codigoInterno} — {a.modelo?.nombre ?? ''}</option>
          ))}
        </select>
        {errors.activoId && <span className="error-msg">{errors.activoId.message}</span>}
      </div>
      <div className="form-group">
        <label>Tipo *</label>
        <select {...register('tipo', { required: 'Requerido' })}>
          <option value="preventivo">Preventivo</option>
          <option value="correctivo">Correctivo</option>
        </select>
      </div>
      <div className="form-group">
        <label>Título *</label>
        <input {...register('titulo', { required: 'Requerido' })} placeholder="Ej: Cambio de aceite y filtros" className={errors.titulo ? 'error' : ''} />
        {errors.titulo && <span className="error-msg">{errors.titulo.message}</span>}
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea {...register('descripcion')} rows={3} />
      </div>
      <div className="form-group">
        <label>Fecha Programada</label>
        <input type="datetime-local" {...register('fechaProgramada')} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Programar'}
        </button>
      </div>
    </form>
  );
};

// ─── Detail drawer ────────────────────────────────────────────────────────────
interface DetailProps { id: string; onClose: () => void; }
const MantenimientoDetail: React.FC<DetailProps> = ({ id, onClose }) => {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { data: m, isLoading, refetch } = useMantenimiento(id);

  const iniciar = useMutation({
    mutationFn: () => api.patch(`/mantenimientos/${id}/iniciar`, {}),
    onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ['mantenimientos'] }); success('Mantenimiento iniciado'); },
    onError: () => error('Error al iniciar'),
  });

  const { register: regCerrar, handleSubmit: hsCerrar, formState: { isSubmitting: closingSubmit } } = useForm<{
    tareasRealizadas?: string; costoTotal?: number;
  }>();

  const cerrar = useMutation({
    mutationFn: async (dto: object) => api.patch(`/mantenimientos/${id}/cerrar`, dto),
    onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ['mantenimientos'] }); success('Mantenimiento cerrado'); },
    onError: () => error('Error al cerrar'),
  });

  const { register: regOT, handleSubmit: hsOT, reset: resetOT, formState: { isSubmitting: otSubmit } } = useForm<{ descripcion: string }>();

  const addOT = useMutation({
    mutationFn: async (dto: { descripcion: string }) => api.post(`/mantenimientos/${id}/ordenes`, dto),
    onSuccess: () => { refetch(); resetOT(); success('Orden de trabajo agregada'); },
    onError: () => error('Error al agregar orden'),
  });

  if (isLoading || !m) return <div className="mant-loading">Cargando...</div>;

  const cfg = ESTADO_CFG[m.estado] ?? { label: m.estado, variant: 'secondary' as BadgeVariant };

  return (
    <div className="mant-detail">
      <div className="mant-detail-header">
        <div>
          <h3>{m.titulo}</h3>
          <span className="mant-activo-code">{m.activo?.codigoInterno} — {m.activo?.modelo?.nombre}</span>
        </div>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>

      {m.descripcion && <p className="mant-desc">{m.descripcion}</p>}

      <div className="mant-meta-grid">
        <div className="mant-meta-item"><label>Tipo</label><span>{m.tipo}</span></div>
        {m.fechaProgramada && <div className="mant-meta-item"><label>Programado</label><span>{new Date(m.fechaProgramada).toLocaleDateString('es-AR')}</span></div>}
        {m.fechaInicio    && <div className="mant-meta-item"><label>Iniciado</label><span>{new Date(m.fechaInicio).toLocaleDateString('es-AR')}</span></div>}
        {m.fechaCierre    && <div className="mant-meta-item"><label>Cerrado</label><span>{new Date(m.fechaCierre).toLocaleDateString('es-AR')}</span></div>}
        {m.costoTotal != null && <div className="mant-meta-item"><label>Costo Total</label><span>${Number(m.costoTotal).toFixed(2)}</span></div>}
      </div>

      {/* Actions */}
      {m.estado === 'programado' && (
        <button className="btn-primary mant-action-btn" onClick={() => iniciar.mutate()} disabled={iniciar.isPending}>
          <Play size={15} /> Iniciar Mantenimiento
        </button>
      )}

      {/* Órdenes de trabajo */}
      {m.estado === 'en_curso' && (
        <div className="mant-ot-section">
          <h4>Órdenes de Trabajo</h4>
          {(m.ordenesTrabajo ?? []).map(ot => (
            <div key={ot.id} className="mant-ot-item">
              <span>{ot.descripcion}</span>
              <Badge variant="secondary">{ot.estado}</Badge>
            </div>
          ))}
          <form className="mant-ot-form" onSubmit={hsOT(v => addOT.mutate(v))}>
            <input {...regOT('descripcion', { required: true })} placeholder="Descripción de la tarea..." />
            <button type="submit" className="btn-primary btn-sm" disabled={otSubmit}>+ Agregar</button>
          </form>
        </div>
      )}

      {/* Cerrar */}
      {m.estado === 'en_curso' && (
        <div className="mant-close-section">
          <h4>Cerrar Mantenimiento</h4>
          <form onSubmit={hsCerrar(v => cerrar.mutate(v))} className="mant-form">
            <div className="form-group">
              <label>Tareas realizadas</label>
              <textarea {...regCerrar('tareasRealizadas')} rows={3} />
            </div>
            <div className="form-group">
              <label>Costo total (USD)</label>
              <input type="number" step="0.01" {...regCerrar('costoTotal', { valueAsNumber: true })} />
            </div>
            <button type="submit" className="btn-success" disabled={closingSubmit}>
              <CheckCircle size={15} /> Cerrar y Liberar Activo
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const Mantenimiento = () => {
  const { data: mantenimientos = [], isLoading } = useMantenimientos();
  const [drawerMode, setDrawerMode] = useState<null | 'create' | string>(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  const filtered = filtroEstado
    ? mantenimientos.filter(m => m.estado === filtroEstado)
    : mantenimientos;

  const columns = [
    { header: 'Activo',    accessor: (m: Mantenimiento) => <span className="mono">{m.activo?.codigoInterno ?? m.activoId.slice(0,8)}</span> },
    { header: 'Título',    accessor: (m: Mantenimiento) => <strong>{m.titulo}</strong> },
    { header: 'Tipo',      accessor: (m: Mantenimiento) => <span className="capitalize">{m.tipo}</span> },
    { header: 'Estado',    accessor: (m: Mantenimiento) => {
      const cfg = ESTADO_CFG[m.estado] ?? { label: m.estado, variant: 'secondary' as BadgeVariant };
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }},
    { header: 'Programado', accessor: (m: Mantenimiento) => m.fechaProgramada ? new Date(m.fechaProgramada).toLocaleDateString('es-AR') : '—' },
    { header: '', accessor: (m: Mantenimiento) => (
      <button className="icon-btn" onClick={e => { e.stopPropagation(); setDrawerMode(m.id); }} title="Ver detalle">
        <Eye size={16} />
      </button>
    )},
  ];

  return (
    <div className="mantenimiento-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Centro de Mantenimiento</h1>
          <p>Programado, correctivo y registro de órdenes de trabajo.</p>
        </div>
        <button className="btn-primary" onClick={() => setDrawerMode('create')}>
          <Plus size={16} /> Nuevo Mantenimiento
        </button>
      </header>

      <div className="filters-bar card-premium">
        <div className="select-wrapper">
          <Filter size={14} />
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="mant-summary">
          {Object.entries(ESTADO_CFG).map(([k, v]) => {
            const count = mantenimientos.filter(m => m.estado === k).length;
            if (!count) return null;
            return <Badge key={k} variant={v.variant}>{v.label}: {count}</Badge>;
          })}
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={filtered}
        isLoading={isLoading}
        onRowClick={(m: Mantenimiento) => setDrawerMode(m.id)}
      />

      <Drawer isOpen={drawerMode === 'create'} onClose={() => setDrawerMode(null)} title="Nuevo Mantenimiento">
        <CreateForm onSuccess={() => setDrawerMode(null)} onCancel={() => setDrawerMode(null)} />
      </Drawer>

      <Drawer
        isOpen={!!drawerMode && drawerMode !== 'create'}
        onClose={() => setDrawerMode(null)}
        title="Detalle de Mantenimiento"
      >
        {drawerMode && drawerMode !== 'create' && (
          <MantenimientoDetail id={drawerMode} onClose={() => setDrawerMode(null)} />
        )}
      </Drawer>
    </div>
  );
};

export default Mantenimiento;
