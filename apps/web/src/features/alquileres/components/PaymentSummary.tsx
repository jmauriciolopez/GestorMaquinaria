import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  History, 
  AlertTriangle,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { Alquiler } from '../types';
import './PaymentSummary.css';

interface Props {
  alquiler: Alquiler;
}

const PaymentSummary: React.FC<Props> = ({ alquiler }) => {
  const totalConPenalidades = Number(alquiler.subtotal) + Number(alquiler.totalPenalidades);
  const saldoPendiente = totalConPenalidades - Number(alquiler.totalPagado);
  const isPaid = saldoPendiente <= 0;

  return (
    <div className="payment-summary">
      <div className="summary-grid">
        <div className="summary-card card-premium">
          <div className="card-header">
            <DollarSign size={20} />
            <h4>Total Contrato</h4>
          </div>
          <div className="amount">USD {Number(alquiler.subtotal).toLocaleString()}</div>
          <div className="label-sub">Monto base pactado</div>
        </div>

        <div className="summary-card card-premium warning">
          <div className="card-header">
            <AlertTriangle size={20} />
            <h4>Cargos Adicionales</h4>
          </div>
          <div className="amount">USD {Number(alquiler.totalPenalidades).toLocaleString()}</div>
          <div className="label-sub">Retrasos, daños o combustible</div>
        </div>

        <div className="summary-card card-premium success">
          <div className="card-header">
            <CreditCard size={20} />
            <h4>Total Pagado</h4>
          </div>
          <div className="amount">USD {Number(alquiler.totalPagado).toLocaleString()}</div>
          <div className="label-sub">Registrado en sistema</div>
        </div>

        <div className={`summary-card card-premium ${isPaid ? 'paid' : 'debt'}`}>
          <div className="card-header">
            <Receipt size={20} />
            <h4>Saldo Pendiente</h4>
          </div>
          <div className="amount">USD {saldoPendiente.toLocaleString()}</div>
          <div className="label-sub">{isPaid ? 'Contrato Liquidado' : 'Pendiente de cobro'}</div>
        </div>
      </div>

      <section className="payment-history card-premium">
        <div className="section-header">
          <div className="title">
            <History size={20} />
            <h3>Historial de Pagos</h3>
          </div>
        </div>

        <div className="history-list">
          <div className="empty-history">
            <InfoIcon size={32} />
            <p>No hay pagos registrados para este contrato. El módulo de finanzas se implementará próximamente.</p>
          </div>
        </div>
      </section>

      {!isPaid && (
        <div className="payment-actions">
          <button className="btn-primary" onClick={() => alert('Próximamente: Integración con Caja/Finanzas')}>
            <DollarSign size={18} />
            Registrar Pago Manual
          </button>
        </div>
      )}
    </div>
  );
};

const InfoIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default PaymentSummary;
