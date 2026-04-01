import React from 'react';
import { HardHat } from 'lucide-react';
import PageTemplate from '../components/common/PageTemplate';

const Activos = () => {
  return (
    <PageTemplate 
      title="Gestión de Activos" 
      description="Listado y control de maquinaria pesada, herramientas y vehículos."
      icon={HardHat}
      addButtonLabel="Nuevo Activo"
    />
  );
};

export default Activos;
