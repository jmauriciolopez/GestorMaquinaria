import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PageTemplate from '../components/common/PageTemplate';

const Penalidades = () => {
  return (
    <PageTemplate 
      title="Gestión de Penalidades" 
      description="Multas por retraso, daños o mala praxis en el uso de maquinaria."
      icon={AlertTriangle}
      addButtonLabel="Nueva Penalidad"
    />
  );
};

export default Penalidades;
