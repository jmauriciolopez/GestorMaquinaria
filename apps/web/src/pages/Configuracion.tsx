import React from 'react';
import { Settings } from 'lucide-react';
import PageTemplate from '../components/common/PageTemplate';

const Configuracion = () => {
  return (
    <PageTemplate 
      title="Configuración de Sistema" 
      description="Ajustes de tenant, perfiles de usuario y parámetros globales."
      icon={Settings}
    />
  );
};

export default Configuracion;
