import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  HardHat, 
  Users, 
  Key, 
  RotateCcw, 
  Wrench, 
  AlertTriangle, 
  Settings,
  X
} from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/activos', icon: HardHat, label: 'Activos' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/alquileres', icon: Key, label: 'Alquileres' },
  { path: '/devoluciones', icon: RotateCcw, label: 'Devoluciones' },
  { path: '/mantenimiento', icon: Wrench, label: 'Mantenimiento' },
  { path: '/penalidades', icon: AlertTriangle, label: 'Penalidades' },
  { path: '/configuracion', icon: Settings, label: 'Configuración' },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <HardHat size={32} color="var(--color-primary)" />
          <span>GESTOR <small>MAQUINARIA</small></span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="icon" />
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <p>© 2026 Maquinaria Corp.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
