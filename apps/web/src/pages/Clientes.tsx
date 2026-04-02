import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  Edit3,
  Trash2
} from 'lucide-react';
import Drawer from '../components/ui/Drawer';
import DataTable from '../components/ui/DataTable';
import ClienteForm from '../features/clientes/components/ClienteForm';
import {
  useClientes,
  useDeleteCliente,
} from '../features/clientes/hooks/useClientesData';
import { Cliente } from '../features/clientes/types';
import './Clientes.css';

const Clientes = () => {
  const [busqueda, setBusqueda] = useState('');
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const { data: clientes, isLoading } = useClientes();
  const deleteCliente = useDeleteCliente();

  const filteredClientes = (clientes ?? []).filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (c.documento ?? '').includes(busqueda)
  );

  const handleCreate = () => {
    setSelectedCliente(null);
    setDrawerOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDrawerOpen(true);
  };

  const handleDelete = async (cliente: Cliente) => {
    const confirmed = window.confirm(
      `Se eliminará el cliente "${cliente.nombre}". Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    await deleteCliente.mutateAsync(cliente.id);
  };

  const columns = [
    { 
      header: 'Cliente', 
      accessor: (c: Cliente) => (
        <div className="client-main-cell">
          <strong>{c.nombre}</strong>
          <span>{c.documento}</span>
        </div>
      )
    },
    { 
      header: 'Contacto', 
      accessor: (c: Cliente) => (
        <div className="contact-cell">
          <div className="contact-item">
            <Mail size={12} />
            <span>{c.email || 'N/A'}</span>
          </div>
          <div className="contact-item">
            <Phone size={12} />
            <span>{c.telefono || 'N/A'}</span>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Dirección', 
      accessor: (c: Cliente) => (
        <div className="address-cell">
          <MapPin size={14} />
          <span>{c.direccion || 'No registrada'}</span>
        </div>
      ) 
    },
    { 
      header: 'Acciones', 
      accessor: (c: Cliente) => (
        <div className="actions-cell">
          <button className="icon-btn" onClick={() => handleEdit(c)} title="Editar">
            <Edit3 size={18} />
          </button>
          <button className="icon-btn" onClick={() => handleDelete(c)} title="Eliminar">
            <Trash2 size={18} />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="clientes-wrapper">
      <header className="page-header">
        <div className="header-info">
          <h1>Directorio de Clientes</h1>
          <p>Administración de empresas y particulares para contratos de alquiler.</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </header>

      <div className="filters-bar card-premium">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o documento..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <DataTable 
        columns={columns as any} 
        data={filteredClientes} 
        isLoading={isLoading}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <ClienteForm
          initialData={selectedCliente}
          onCancel={() => setDrawerOpen(false)}
          onSuccess={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};

export default Clientes;
