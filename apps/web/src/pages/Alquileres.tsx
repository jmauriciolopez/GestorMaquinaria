import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  FileText,
  Filter,
  User,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlquileres } from '../features/alquileres/hooks/useAlquileresData';
import { Alquiler, EstadoAlquiler } from '../features/alquileres/types';
import DataTable from '../components/ui/DataTable';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import AlquilerForm from '../features/alquileres/components/AlquilerForm';
import './Alquileres.css';

const getStatusBadge = (estado: EstadoAlquiler) => {
  const map: Record<EstadoAlquiler, { label: string; variant: BadgeVariant }> = {
    [EstadoAlquiler.BORRADOR]: { label: 'Borrador', variant: 'secondary' },
    [EstadoAlquiler.CONFIRMADO]: { label: 'Confirmado', variant: 'primary' },
    [EstadoAlquiler.ENTREGADO]: { label: 'En Curso', variant: 'info' },
    [EstadoAlquiler.DEVUELTO_PARCIAL]: { label: 'Dev. Parcial', variant: 'warning' },
    [EstadoAlquiler.DEVUELTO]: { label: 'Devuelto', variant: 'success' },
    [EstadoAlquiler.CANCELADO]: { label: 'Cancelado', variant: 'error' },
    [EstadoAlquiler.FINALIZADO]: { label: 'Finalizado', variant: 'success' },
  };
  const config = map[estado] || { label: estado, variant: 'secondary' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const Alquileres = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const { data: alquileres, isLoading } = useAlquileres();

  const filteredAlquileres = alquileres?.filter(a => {
    const matchBusqueda = (a.cliente?.nombre?.toLowerCase() || '').includes(busqueda.toLowerCase()) || 
                          (a.id?.toLowerCase() || '').includes(busqueda.toLowerCase());
    const matchEstado = !filtroEstado || a.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const columns = [
    { 
      header: 'Referencia', 
      accessor: (a: Alquiler) => (
        <div className="ref-cell">
          <strong>#{a.id.split('-')[0].toUpperCase()}</strong>
          <span>{new Date(a.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    { 
      header: 'Cliente', 
      accessor: (a: Alquiler) => (
        <div className="cliente-cell">
          <User size={14} />
          <span>{a.cliente?.nombre}</span>
        </div>
      ) 
    },
    { 
      header: 'Vigencia', 
      accessor: (a: Alquiler) => (
        <div className="vigencia-cell">
          <div className="range">
            <span>{new Date(a.fechaInicio).toLocaleDateString()}</span>
            <ArrowRight size={12} />
            <span>{new Date(a.fechaFinPrevista).toLocaleDateString()}</span>
          </div>
        </div>
      ) 
    },
    { header: 'Estado', accessor: (a: Alquiler) => getStatusBadge(a.estado) },
    { 
      header: 'Total', 
      accessor: (a: Alquiler) => (
        <div className="total-cell">
          <strong>USD {Number(a.subtotal).toLocaleString()}</strong>
        </div>
      ) 
    },
    { 
      header: 'Acciones', 
      accessor: (a: Alquiler) => (
        <div className="actions-cell">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); navigate(`/alquileres/${a.id}`); }} title="Ver Detalle">
            <Eye size={18} />
          </button>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }} title="Contrato">
            <FileText size={18} />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="alquileres-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Operativa de Alquileres</h1>
          <p>Seguimiento de contratos, entregas y devoluciones de equipos.</p>
        </div>
        <button className="btn-primary" onClick={() => setDrawerOpen(true)}>
          <Plus size={18} />
          Nueva Reserva
        </button>
      </header>

      <div className="filters-bar card-premium">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente o ID..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="select-filters">
          <div className="select-wrapper">
            <Filter size={16} />
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.values(EstadoAlquiler).map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns as any} 
        data={filteredAlquileres || []} 
        isLoading={isLoading}
        onRowClick={(a: Alquiler) => navigate(`/alquileres/${a.id}`)}
      />

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title="Nueva Reserva / Alquiler"
      >
        <AlquilerForm 
          onCancel={() => setDrawerOpen(false)}
          onSuccess={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};

export default Alquileres;
