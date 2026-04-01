import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Eye, 
  Edit3, 
  Trash2, 
  Filter,
  AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActivos, useMutateActivo } from '../features/activos/hooks/useActivosData';
import { Activo, EstadoActivo } from '../features/activos/types';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import AssetForm from '../features/activos/components/AssetForm';
import './Activos.css';

const getStatusBadge = (estado: EstadoActivo) => {
  const map: Record<EstadoActivo, { label: string; variant: BadgeVariant }> = {
    [EstadoActivo.DISPONIBLE]: { label: 'Disponible', variant: 'success' },
    [EstadoActivo.ALQUILADO]: { label: 'Alquilado', variant: 'info' },
    [EstadoActivo.EN_MANTENIMIENTO]: { label: 'Mantenimiento', variant: 'warning' },
    [EstadoActivo.FUERA_DE_SERVICIO]: { label: 'Fuera de Servicio', variant: 'error' },
    [EstadoActivo.RESERVADO]: { label: 'Reservado', variant: 'primary' },
  };
  const config = map[estado] || { label: estado, variant: 'secondary' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const Activos = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null);
  const [params, setParams] = useState({ busqueda: '', estado: '' });

  const { data: result, isLoading } = useActivos(params);
  const mutate = useMutateActivo(selectedActivo?.id);

  const columns = [
    { 
      header: 'Código', 
      accessor: (a: Activo) => (
        <div className="codigo-cell">
          <strong>{a.codigoInterno}</strong>
          <span>{a.numeroSerie}</span>
        </div>
      )
    },
    { header: 'Equipo', accessor: 'nombre' },
    { 
      header: 'Modelo', 
      accessor: (a: Activo) => (
        <div className="model-cell">
          <span>{a.modelo?.nombre}</span>
          <small>{a.modelo?.categoria?.nombre}</small>
        </div>
      ) 
    },
    { header: 'Estado', accessor: (a: Activo) => getStatusBadge(a.estado) },
    { 
      header: 'Ubicación', 
      accessor: (a: Activo) => (
        <div className="location-cell">
          <MapPin size={14} />
          <span>{a.sucursal?.nombre || 'Taller Central'}</span>
        </div>
      ) 
    },
    { 
      header: 'Acciones', 
      accessor: (a: Activo) => (
        <div className="actions-cell">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); navigate(`/activos/${a.id}`); }} title="Ver Detalle">
            <Eye size={18} />
          </button>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleEdit(a); }} title="Editar">
            <Edit3 size={18} />
          </button>
        </div>
      ) 
    },
  ];

  const handleEdit = (activo: Activo) => {
    setSelectedActivo(activo);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedActivo(null);
    setDrawerOpen(true);
  };

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

      <div className="filters-bar card-premium">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código o serie..." 
            value={params.busqueda}
            onChange={(e) => setParams({ ...params, busqueda: e.target.value })}
          />
        </div>
        <div className="select-filters">
          <div className="select-wrapper">
            <Filter size={16} />
            <select 
              value={params.estado} 
              onChange={(e) => setParams({ ...params, estado: e.target.value })}
            >
              <option value="">Todos los estados</option>
              {Object.values(EstadoActivo).map(e => (
                <option key={e} value={e}>{e.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns as any} 
        data={result?.data || []} 
        isLoading={isLoading}
        onRowClick={(a: Activo) => navigate(`/activos/${a.id}`)}
      />

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
