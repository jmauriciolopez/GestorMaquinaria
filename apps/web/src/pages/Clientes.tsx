import React from 'react';
import { Users } from 'lucide-react';
import PageTemplate from '../components/common/PageTemplate';

const Clientes = () => {
  return (
    <PageTemplate 
      title="Base de Clientes" 
      description="Gestión integral de clientes corporativos y particulares."
      icon={Users}
      addButtonLabel="Nuevo Cliente"
    />
  );
};

export default Clientes;
