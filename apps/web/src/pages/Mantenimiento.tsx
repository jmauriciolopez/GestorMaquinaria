import React from 'react';
import { Wrench } from 'lucide-react';
import PageTemplate from '../components/common/PageTemplate';

const Mantenimiento = () => {
  return (
    <PageTemplate 
      title="Centro de Mantenimiento" 
      description="Programado, correctivo y registro de órdenes de trabajo."
      icon={Wrench}
      addButtonLabel="Nuevo Mantenimiento"
    />
  );
};

export default Mantenimiento;
