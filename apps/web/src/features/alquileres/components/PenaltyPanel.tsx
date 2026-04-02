import React, { useState } from 'react';
import { 
  AlertCircle, 
  Edit3, 
  History, 
  Info,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { usePenalidades, useOverridePenalidad } from '../hooks/useAlquileresData';
import Badge from '../../../components/ui/Badge';
import Drawer from '../../../components/ui/Drawer';
import './PenaltyPanel.css';

interface Props {
  alquilerId: string;
}

const PenaltyPanel: React.FC<Props> = ({ alquilerId }) => {
  const { data: penalidades, isLoading } = usePenalidades(alquilerId);
  const overrideMutation = useOverridePenalidad();
  const [selectedPenalty, setSelectedPenalty] = useState<any>(null);
  const [overrideData, setOverrideData] = useState({ montoOverride: 0, descripcion: '' });

  if (isLoading) return <div>Cargando penalidades...</div>;

  const handleOpenOverride = (p: any) => {
    setSelectedPenalty(p);
    setOverrideData({ montoOverride: Number(p.montoFinal), descripcion: '' });
  };

  const handleApplyOverride = () => {
    if (!overrideData.descripcion) return alert('Debe indicar un motivo para el ajuste');
    overrideMutation.mutate({
      id: selectedPenalty.id,
      ...overrideData
    }, {
      onSuccess: () => setSelectedPenalty(null)
    });
  };

  return (
    <div className="penalty-panel">
      <div className="panel-header">
        <div className="title">
          <AlertCircle size={20} />
          <h3>Cargos Adicionales y Penalidades</h3>
        </div>
      </div>

      <div className="penalties-list">
        {penalidades?.map((p) => (
          <div key={p.id} className="penalty-card card-premium">
            <div className="penalty-main">
              <div className="p-info">
                <div className="p-type">
                  <strong>{p.tipo.replace('_', ' ')}</strong>
                  <Badge variant={p.estado === 'PENDIENTE' ? 'warning' : 'success'}>
                    {p.estado}
                  </Badge>
                </div>
                <p className="p-motivo">{p.motivo}</p>
                {p.activoId && (
                  <span className="p-target">Equipo: {p.activoId.split('-')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="p-amounts">
                <div className="original">Original: USD {Number(p.montoOriginal).toLocaleString()}</div>
                <div className="final">Final: USD {Number(p.montoFinal).toLocaleString()}</div>
              </div>
              <div className="p-actions">
                <button 
                  className="btn-icon-adjust"
                  onClick={() => handleOpenOverride(p)}
                  title="Ajustar Monto (Admin)"
                >
                  <Edit3 size={18} />
                </button>
              </div>
            </div>
            {p.usuarioOverrideId && (
              <div className="p-override-info">
                <ShieldCheck size={14} />
                <span>Monto ajustado por Administrador. Motivo: {p.observaciones}</span>
              </div>
            )}
          </div>
        ))}

        {!penalidades?.length && (
          <div className="empty-penalties">
            <CheckCircle2 size={32} />
            <p>No se registran penalidades ni cargos adicionales para este contrato.</p>
          </div>
        )}
      </div>

      <Drawer 
        isOpen={!!selectedPenalty} 
        onClose={() => setSelectedPenalty(null)} 
        title="Ajuste Manual de Penalidad"
      >
        <div className="override-form">
          <div className="alert-box info">
            <Info size={20} />
            <p>Esta acción solo puede ser realizada por administradores y quedará registrada en el historial técnico.</p>
          </div>

          <div className="form-group">
            <label>Nuevo Monto (USD)</label>
            <input 
              type="number" 
              value={overrideData.montoOverride}
              onChange={(e) => setOverrideData({ ...overrideData, montoOverride: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Motivo del Ajuste / Autorización</label>
            <textarea 
              placeholder="Ej: Descuento comercial autorizado por gerencia..."
              value={overrideData.descripcion}
              onChange={(e) => setOverrideData({ ...overrideData, descripcion: e.target.value })}
            />
          </div>

          <div className="drawer-actions">
            <button className="btn-secondary" onClick={() => setSelectedPenalty(null)}>Cancelar</button>
            <button 
              className="btn-primary" 
              onClick={handleApplyOverride}
              disabled={overrideMutation.isPending}
            >
              {overrideMutation.isPending ? 'Guardando...' : 'Aplicar Ajuste'}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default PenaltyPanel;
