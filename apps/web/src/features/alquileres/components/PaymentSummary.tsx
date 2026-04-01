import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  History, 
  AlertTriangle,
  Receipt,
  Plus
} from 'lucide-react';
import { Alquiler } from '../types';
import PaymentList from '../../finanzas/components/PaymentList';
import PaymentForm from '../../finanzas/components/PaymentForm';
import Drawer from '../../../components/ui/Drawer';
import './PaymentSummary.css';

interface Props {
  alquiler: Alquiler;
}

const PaymentSummary: React.FC<Props> = ({ alquiler }) => {
  const [isPaymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  
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
          <div className="amount">USD {Math.max(0, saldoPendiente).toLocaleString()}</div>
          <div className="label-sub">{isPaid ? 'Contrato Liquidado' : 'Pendiente de cobro'}</div>
        </div>
      </div>

      <div className="payment-history-section">
        <PaymentList alquilerId={alquiler.id} />
      </div>

      {!isPaid && (
        <div className="payment-actions">
          <button className="btn-primary" onClick={() => setPaymentDrawerOpen(true)}>
            <Plus size={18} />
            Registrar Nuevo Cobro
          </button>
        </div>
      )}

      <Drawer 
        isOpen={isPaymentDrawerOpen} 
        onClose={() => setPaymentDrawerOpen(false)} 
        title="Registrar Cobro de Alquiler"
      >
        <PaymentForm 
          alquilerId={alquiler.id} 
          onSuccess={() => setPaymentDrawerOpen(false)}
          onCancel={() => setPaymentDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};

export default PaymentSummary;
