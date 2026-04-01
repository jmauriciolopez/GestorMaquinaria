import React from 'react';
import { RotateCcw } from 'lucide-react';
import PageTemplate from '../components/common/PageTemplate';

const Devoluciones = () => {
  return (
    <PageTemplate 
      title="Retornos y Devoluciones" 
      description="Procesamiento de check-ins y verificación de estado de activos."
      icon={RotateCcw}
      addButtonLabel="Nueva Devolución"
    />
  );
};

export default Devoluciones;
