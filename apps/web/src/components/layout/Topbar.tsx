import React from 'react';
import { Bell, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import './Topbar.css';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Buscar activos, clientes..." />
      </div>

      <div className="topbar-actions">
        <button className="action-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.nombre || 'Bienvenido'}</span>
            <span className="user-role">{user?.rol || 'Operador'}</span>
          </div>
          <div className="user-avatar">
            <User size={20} />
          </div>
          <button className="logout-btn" onClick={logout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
