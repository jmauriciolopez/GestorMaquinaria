import React from 'react';
import { 
  History, 
  User, 
  Calendar, 
  CreditCard, 
  Hash,
  ArrowRight,
  Download
} from 'lucide-react';
import { useReports } from '../../../hooks/useReports';
import { usePagosAlquiler } from '../hooks/usePagosData';
import { MetodoPago } from '../types';
import Badge from '../../../components/ui/Badge';
import './PaymentList.tsx.css';

interface Props {
  alquilerId: string;
}

const getMetodoLabel = (metodo: MetodoPago) => {
  const map: Record<MetodoPago, string> = {
    [MetodoPago.EFECTIVO]: 'Efectivo',
    [MetodoPago.TRANSFERENCIA]: 'Transferencia',
    [MetodoPago.TARJETA]: 'Tarjeta de Cred./Deb.',
    [MetodoPago.CHEQUE]: 'Cheque',
    [MetodoPago.OTRO]: 'Otro',
  };
  return map[metodo] || metodo;
};

const PaymentList: React.FC<Props> = ({ alquilerId }) => {
  const { data: pagos, isLoading } = usePagosAlquiler(alquilerId);
  const { downloadReceipt } = useReports();

  if (isLoading) return <div className="loading-state">Cargando transacciones...</div>;

  return (
    <div className="payment-history">
      <div className="history-header">
        <History size={18} />
        <h4>Historial de Transacciones</h4>
      </div>

      <div className="transactions-list">
        {pagos?.map((p) => (
          <div key={p.id} className="transaction-card card-premium">
            <div className="tx-main">
              <div className="tx-date-group">
                <Calendar size={14} />
                <span>{new Date(p.fecha).toLocaleDateString()}</span>
              </div>
              <div className="tx-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className="btn-icon-sm" 
                  onClick={() => downloadReceipt(p.id)}
                  title="Descargar Recibo PDF"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <Download size={16} />
                </button>
                <div className="tx-amount">
                  <Badge variant="success">USD {Number(p.monto).toLocaleString()}</Badge>
                </div>
              </div>
            </div>

            <div className="tx-details">
              <div className="detail-item">
                <CreditCard size={12} />
                <span>{getMetodoLabel(p.metodoPago)}</span>
              </div>
              {p.referencia && (
                <div className="detail-item">
                  <Hash size={12} />
                  <span>REF: {p.referencia}</span>
                </div>
              )}
              <div className="detail-item">
                <User size={12} />
                <span>Por: {p.usuario?.nombre || 'Sist.'}</span>
              </div>
            </div>

            {p.notas && (
              <div className="tx-notes">
                <p>{p.notas}</p>
              </div>
            )}
          </div>
        ))}

        {!pagos?.length && (
          <div className="empty-history">
            <p>No se registran cobros vinculados a este contrato.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;
