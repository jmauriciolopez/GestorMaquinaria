import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Package, 
  AlertCircle,
  Truck,
  RotateCcw,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  FileText
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { 
  useAlquiler, 
  useConfirmarAlquiler,
  usePenalidades 
} from '../features/alquileres/hooks/useAlquileresData';
import { EstadoAlquiler, AlquilerItem } from '../features/alquileres/types';
import Badge, { BadgeVariant } from '../components/ui/Badge';
import Drawer from '../components/ui/Drawer';
import CheckInOutForm from '../features/alquileres/components/CheckInOutForm';
import PenaltyPanel from '../features/alquileres/components/PenaltyPanel';
import PaymentSummary from '../features/alquileres/components/PaymentSummary';
import './AlquilerDetail.css';

const getStatusBadge = (estado?: EstadoAlquiler) => {
  if (!estado) return null;
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

const AlquilerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'items' | 'penalties' | 'payments'>('items');
  const [selectedItem, setSelectedItem] = useState<{ item: AlquilerItem; mode: 'out' | 'in' } | null>(null);

  const { data: alquiler, isLoading } = useAlquiler(id);
  const { data: penalidades } = usePenalidades(id);
  const { downloadContract } = useReports();
  const confirmarMutation = useConfirmarAlquiler();

  if (isLoading) return <div className="page-loader">Cargando contrato...</div>;
  if (!alquiler) return <div className="page-error">No se encontró el alquiler.</div>;

  const handleConfirmar = () => {
    if (confirm('¿Confirmar esta reserva para convertirla en alquiler activo?')) {
      confirmarMutation.mutate(alquiler.id);
    }
  };

  return (
    <div className="alquiler-detail-wrapper">
      <header className="page-header-simple">
        <button className="back-btn" onClick={() => navigate('/alquileres')}>
          <ArrowLeft size={20} />
          Volver a Listado
        </button>
        <div className="header-actions">
          {alquiler.estado === EstadoAlquiler.BORRADOR && (
            <button className="btn-primary" onClick={handleConfirmar} disabled={confirmarMutation.isPending}>
              <CheckCircle2 size={18} />
              Confirmar Alquiler
            </button>
          )}
          {alquiler.estado !== EstadoAlquiler.CANCELADO && alquiler.estado !== EstadoAlquiler.FINALIZADO && (
            <button className="btn-secondary text-error">
              <XCircle size={18} />
              Cancelar
            </button>
          )}
          <button 
            className="btn-secondary" 
            onClick={() => downloadContract(alquiler.id)}
            title="Descargar Contrato PDF"
          >
            <FileText size={18} />
            Contrato
          </button>
          <button className="btn-icon-more">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          {/* Main Info Card */}
          <section className="card-premium main-info">
            <div className="info-header">
              <div className="title-group">
                <span className="ref-id">CONTRATO #{alquiler.id.split('-')[0].toUpperCase()}</span>
                <h1>{alquiler.cliente?.nombre}</h1>
                <div className="meta-info">
                  <div className="meta-item">
                    <User size={14} />
                    <span>{alquiler.cliente?.documento}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Inicia: {new Date(alquiler.fechaInicio).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="status-group">
                {getStatusBadge(alquiler.estado)}
              </div>
            </div>
          </section>

          {/* Navigation Tabs */}
          <nav className="detail-tabs">
            <button 
              className={activeTab === 'items' ? 'active' : ''} 
              onClick={() => setActiveTab('items')}
            >
              <Package size={18} />
              Equipos y Entrega
            </button>
            <button 
              className={activeTab === 'penalties' ? 'active' : ''} 
              onClick={() => setActiveTab('penalties')}
            >
              <AlertCircle size={18} />
              Penalidades ({penalidades?.length || 0})
            </button>
            <button 
              className={activeTab === 'payments' ? 'active' : ''} 
              onClick={() => setActiveTab('payments')}
            >
              <DollarSign size={18} />
              Pagos y Saldo
            </button>
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'items' && (
              <section className="items-list">
                {alquiler.items.map((item) => (
                  <div key={item.id} className="asset-item-card card-premium">
                    <div className="asset-info">
                      <div className="asset-title">
                        <strong>{item.activo?.nombre || 'Equipo no vinculado'}</strong>
                        <span>ID: {item.activo?.codigoInterno || '---'}</span>
                      </div>
                      <div className="asset-status">
                        {item.activo?.estado === 'ALQUILADO' ? (
                          <Badge variant="info">En Posesión</Badge>
                        ) : item.activo?.estado === 'DISPONIBLE' ? (
                          <Badge variant="success">Pendiente Entrega</Badge>
                        ) : (
                          <Badge variant="secondary">{item.activo?.estado || 'Desconocido'}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="asset-actions">
                      {alquiler.estado === EstadoAlquiler.CONFIRMADO && item.activo?.estado !== 'ALQUILADO' && (
                        <button 
                          className="btn-action-primary"
                          onClick={() => setSelectedItem({ item, mode: 'out' })}
                        >
                          <Truck size={16} />
                          Entregar Activo
                        </button>
                      )}
                      {alquiler.estado === EstadoAlquiler.ENTREGADO && (
                        <button 
                          className="btn-action-outline"
                          onClick={() => setSelectedItem({ item, mode: 'in' })}
                        >
                          <RotateCcw size={16} />
                          Registrar Devolución
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {activeTab === 'penalties' && (
              <PenaltyPanel alquilerId={alquiler.id} />
            )}

            {activeTab === 'payments' && (
              <PaymentSummary alquiler={alquiler} />
            )}
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="card-premium summary-card">
            <h3>Resumen del Contrato</h3>
            <div className="summary-list">
              <div className="summary-item">
                <label>Fin Previsto</label>
                <span>{new Date(alquiler.fechaFinPrevista).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <label>Días Totales</label>
                <span>5 días</span>
              </div>
              <div className="summary-item highlight">
                <label>Total Contrato</label>
                <span>USD {Number(alquiler.subtotal).toLocaleString()}</span>
              </div>
            </div>
            {alquiler.notas && (
              <div className="notes-box">
                <label>Observaciones:</label>
                <p>{alquiler.notas}</p>
              </div>
            )}
          </div>

          <div className="card-premium status-flow">
            <h3>Flujo Operativo</h3>
            <div className="flow-steps">
              <div className={`step ${alquiler.estado !== EstadoAlquiler.BORRADOR ? 'completed' : 'active'}`}>
                <div className="dot"></div>
                <label>Reserva / Borrador</label>
              </div>
              <div className={`step ${[EstadoAlquiler.ENTREGADO, EstadoAlquiler.DEVUELTO].includes(alquiler.estado) ? 'completed' : alquiler.estado === EstadoAlquiler.CONFIRMADO ? 'active' : 'pending'}`}>
                <div className="dot"></div>
                <label>Confirmación</label>
              </div>
              <div className={`step ${alquiler.estado === EstadoAlquiler.DEVUELTO ? 'completed' : alquiler.estado === EstadoAlquiler.ENTREGADO ? 'active' : 'pending'}`}>
                <div className="dot"></div>
                <label>Entrega en Obra</label>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Drawer 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        title={selectedItem?.mode === 'out' ? 'Check-out de Activo' : 'Check-in / Devolución'}
      >
        {selectedItem && (
          <CheckInOutForm 
            alquilerId={alquiler.id}
            item={selectedItem.item}
            mode={selectedItem.mode}
            onCancel={() => setSelectedItem(null)}
            onSuccess={() => setSelectedItem(null)}
          />
        )}
      </Drawer>
    </div>
  );
};

export default AlquilerDetail;
