import React, { useState } from 'react';
import { Settings, Tag, Cpu, Building2, Plus, Edit3, Trash2, X, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import './Configuracion.css';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Categoria { id: string; nombre: string; descripcion?: string; }
interface Modelo    { id: string; nombre: string; marca?: string; descripcion?: string; categoriaId: string; categoria?: Categoria; }
interface Sucursal  { id: string; nombre: string; direccion?: string; telefono?: string; email?: string; activa: boolean; }

// ─── Hooks ───────────────────────────────────────────────────────────────────
const useCategorias = () => useQuery<Categoria[]>({
  queryKey: ['categorias'],
  queryFn: async () => { const { data } = await api.get('/categorias-activo'); return data?.data ?? data ?? []; },
});

const useModelos = (categoriaId?: string) => useQuery<Modelo[]>({
  queryKey: ['modelos', categoriaId ?? 'all'],
  queryFn: async () => {
    const { data } = await api.get('/modelos-activo', { params: categoriaId ? { categoriaId } : {} });
    return data?.data ?? data ?? [];
  },
});

const useSucursales = () => useQuery<Sucursal[]>({
  queryKey: ['sucursales'],
  queryFn: async () => { const { data } = await api.get('/sucursales'); return data?.data ?? data ?? []; },
});

// ─── Generic inline form modal ───────────────────────────────────────────────
interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; }
const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="cfg-modal-overlay" onClick={onClose}>
    <div className="cfg-modal" onClick={e => e.stopPropagation()}>
      <div className="cfg-modal-header">
        <h3>{title}</h3>
        <button className="cfg-modal-close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="cfg-modal-body">{children}</div>
    </div>
  </div>
);

// ─── Categorías section ───────────────────────────────────────────────────────
const CategoriasSection: React.FC = () => {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { data: categorias = [], isLoading } = useCategorias();
  const [modal, setModal] = useState<null | 'create' | Categoria>(null);

  const save = useMutation({
    mutationFn: async (values: { nombre: string; descripcion?: string }) => {
      if (modal && typeof modal === 'object') {
        await api.patch(`/categorias-activo/${modal.id}`, values);
      } else {
        await api.post('/categorias-activo', values);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] });
      success(modal && typeof modal === 'object' ? 'Categoría actualizada' : 'Categoría creada');
      setModal(null);
    },
    onError: () => error('Error al guardar la categoría'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/categorias-activo/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); success('Categoría eliminada'); },
    onError: () => error('No se puede eliminar (tiene modelos asociados)'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ nombre: string; descripcion?: string }>();

  const openEdit = (c: Categoria) => { reset({ nombre: c.nombre, descripcion: c.descripcion ?? '' }); setModal(c); };
  const openCreate = () => { reset({ nombre: '', descripcion: '' }); setModal('create'); };

  return (
    <div className="cfg-section">
      <div className="cfg-section-header">
        <div className="cfg-section-title"><Tag size={18} /><h2>Categorías de Activo</h2></div>
        <button className="btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Nueva</button>
      </div>
      {isLoading ? <p className="cfg-loading">Cargando...</p> : (
        <div className="cfg-list">
          {categorias.length === 0 && <p className="cfg-empty">Sin categorías registradas.</p>}
          {categorias.map(c => (
            <div key={c.id} className="cfg-item">
              <div className="cfg-item-info">
                <strong>{c.nombre}</strong>
                {c.descripcion && <span>{c.descripcion}</span>}
              </div>
              <div className="cfg-item-actions">
                <button className="icon-btn" onClick={() => openEdit(c)}><Edit3 size={15} /></button>
                <button className="icon-btn icon-btn-danger" onClick={() => window.confirm('¿Eliminar categoría?') && del.mutate(c.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={typeof modal === 'object' ? 'Editar Categoría' : 'Nueva Categoría'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(v => save.mutate(v))} className="cfg-form">
            <div className="form-group">
              <label>Nombre *</label>
              <input {...register('nombre', { required: 'Requerido' })} className={errors.nombre ? 'error' : ''} />
              {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea {...register('descripcion')} rows={2} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={save.isPending}>
                {save.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── Modelos section ──────────────────────────────────────────────────────────
const ModelosSection: React.FC = () => {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { data: categorias = [] } = useCategorias();
  const [filterCat, setFilterCat] = useState('');
  const { data: modelos = [], isLoading } = useModelos(filterCat || undefined);
  const [modal, setModal] = useState<null | 'create' | Modelo>(null);

  const save = useMutation({
    mutationFn: async (values: { nombre: string; categoriaId: string; marca?: string; descripcion?: string }) => {
      if (modal && typeof modal === 'object') {
        await api.patch(`/modelos-activo/${modal.id}`, values);
      } else {
        await api.post('/modelos-activo', values);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modelos'] });
      success(modal && typeof modal === 'object' ? 'Modelo actualizado' : 'Modelo creado');
      setModal(null);
    },
    onError: () => error('Error al guardar el modelo'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/modelos-activo/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['modelos'] }); success('Modelo eliminado'); },
    onError: () => error('No se puede eliminar (tiene activos asociados)'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ nombre: string; categoriaId: string; marca?: string; descripcion?: string }>();

  const openEdit = (m: Modelo) => { reset({ nombre: m.nombre, categoriaId: m.categoriaId, marca: m.marca ?? '', descripcion: m.descripcion ?? '' }); setModal(m); };
  const openCreate = () => { reset({ nombre: '', categoriaId: filterCat, marca: '', descripcion: '' }); setModal('create'); };

  return (
    <div className="cfg-section">
      <div className="cfg-section-header">
        <div className="cfg-section-title"><Cpu size={18} /><h2>Modelos de Activo</h2></div>
        <div className="cfg-section-controls">
          <div className="select-wrapper">
            <ChevronDown size={14} />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <button className="btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Nuevo</button>
        </div>
      </div>
      {isLoading ? <p className="cfg-loading">Cargando...</p> : (
        <div className="cfg-list">
          {modelos.length === 0 && <p className="cfg-empty">Sin modelos registrados.</p>}
          {modelos.map(m => (
            <div key={m.id} className="cfg-item">
              <div className="cfg-item-info">
                <strong>{m.nombre}</strong>
                <span>{m.marca ? `${m.marca} · ` : ''}{m.categoria?.nombre ?? ''}</span>
              </div>
              <div className="cfg-item-actions">
                <button className="icon-btn" onClick={() => openEdit(m)}><Edit3 size={15} /></button>
                <button className="icon-btn icon-btn-danger" onClick={() => window.confirm('¿Eliminar modelo?') && del.mutate(m.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={typeof modal === 'object' ? 'Editar Modelo' : 'Nuevo Modelo'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(v => save.mutate(v))} className="cfg-form">
            <div className="form-group">
              <label>Categoría *</label>
              <select {...register('categoriaId', { required: 'Requerido' })} className={errors.categoriaId ? 'error' : ''}>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {errors.categoriaId && <span className="error-msg">{errors.categoriaId.message}</span>}
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input {...register('nombre', { required: 'Requerido' })} className={errors.nombre ? 'error' : ''} />
              {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
            </div>
            <div className="form-group">
              <label>Marca</label>
              <input {...register('marca')} placeholder="Caterpillar, Komatsu..." />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea {...register('descripcion')} rows={2} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={save.isPending}>
                {save.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── Sucursales section ───────────────────────────────────────────────────────
const SucursalesSection: React.FC = () => {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { data: sucursales = [], isLoading } = useSucursales();
  const [modal, setModal] = useState<null | 'create' | Sucursal>(null);

  const save = useMutation({
    mutationFn: async (values: { nombre: string; direccion?: string; telefono?: string; email?: string }) => {
      if (modal && typeof modal === 'object') {
        await api.patch(`/sucursales/${modal.id}`, values);
      } else {
        await api.post('/sucursales', values);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sucursales'] });
      success(modal && typeof modal === 'object' ? 'Sucursal actualizada' : 'Sucursal creada');
      setModal(null);
    },
    onError: () => error('Error al guardar la sucursal'),
  });

  const toggle = useMutation({
    mutationFn: ({ id, activa }: { id: string; activa: boolean }) => api.patch(`/sucursales/${id}`, { activa }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sucursales'] }); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ nombre: string; direccion?: string; telefono?: string; email?: string }>();

  const openEdit = (s: Sucursal) => { reset({ nombre: s.nombre, direccion: s.direccion ?? '', telefono: s.telefono ?? '', email: s.email ?? '' }); setModal(s); };
  const openCreate = () => { reset({ nombre: '', direccion: '', telefono: '', email: '' }); setModal('create'); };

  return (
    <div className="cfg-section">
      <div className="cfg-section-header">
        <div className="cfg-section-title"><Building2 size={18} /><h2>Sucursales</h2></div>
        <button className="btn-primary btn-sm" onClick={openCreate}><Plus size={14} /> Nueva</button>
      </div>
      {isLoading ? <p className="cfg-loading">Cargando...</p> : (
        <div className="cfg-list">
          {sucursales.length === 0 && <p className="cfg-empty">Sin sucursales registradas.</p>}
          {sucursales.map(s => (
            <div key={s.id} className={`cfg-item ${!s.activa ? 'cfg-item--inactive' : ''}`}>
              <div className="cfg-item-info">
                <strong>{s.nombre}</strong>
                <span>{[s.direccion, s.telefono].filter(Boolean).join(' · ')}</span>
              </div>
              <div className="cfg-item-actions">
                <button
                  className={`cfg-toggle ${s.activa ? 'active' : ''}`}
                  onClick={() => toggle.mutate({ id: s.id, activa: !s.activa })}
                  title={s.activa ? 'Desactivar' : 'Activar'}
                >
                  {s.activa ? 'Activa' : 'Inactiva'}
                </button>
                <button className="icon-btn" onClick={() => openEdit(s)}><Edit3 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={typeof modal === 'object' ? 'Editar Sucursal' : 'Nueva Sucursal'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(v => save.mutate(v))} className="cfg-form">
            <div className="form-group">
              <label>Nombre *</label>
              <input {...register('nombre', { required: 'Requerido' })} className={errors.nombre ? 'error' : ''} />
              {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input {...register('direccion')} />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input {...register('telefono')} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" {...register('email')} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={save.isPending}>
                {save.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'categorias', label: 'Categorías',  icon: Tag      },
  { id: 'modelos',    label: 'Modelos',     icon: Cpu      },
  { id: 'sucursales', label: 'Sucursales',  icon: Building2 },
] as const;

type TabId = typeof TABS[number]['id'];

const Configuracion = () => {
  const [tab, setTab] = useState<TabId>('categorias');

  return (
    <div className="configuracion-wrapper">
      <header className="page-header">
        <div className="header-info">
          <Settings size={24} />
          <div>
            <h1>Configuración</h1>
            <p>Gestión de categorías, modelos y sucursales.</p>
          </div>
        </div>
      </header>

      <div className="cfg-tabs card-premium">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`cfg-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'categorias' && <CategoriasSection />}
      {tab === 'modelos'    && <ModelosSection />}
      {tab === 'sucursales' && <SucursalesSection />}
    </div>
  );
};

export default Configuracion;
