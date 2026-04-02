import React from 'react';
import { useToast, Toast } from '../../context/ToastContext';
import './ToastContainer.css';

const icons: Record<string, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { dismiss } = useToast();
  return (
    <div className={`toast toast--${toast.type}`}>
      <span className="toast-icon">{icons[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => dismiss(toast.id)}>×</button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
};
