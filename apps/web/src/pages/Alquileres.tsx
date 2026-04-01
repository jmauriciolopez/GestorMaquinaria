import React from 'react';
import { Key } from 'lucide-react';
import PageTemplate from '../components/common/PageTemplate';

const Alquileres = () => {
  return (
    <PageTemplate 
      title="Gestión de Alquileres" 
      description="Seguimiento de contratos, check-outs y estados de alquiler."
      icon={Key}
      addButtonLabel="Nuevo Alquiler"
    />
  );
};

export default Alquileres;
