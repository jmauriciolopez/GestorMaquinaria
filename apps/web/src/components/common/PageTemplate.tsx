import React from 'react';
import { LucideIcon, Plus, Search, Filter, Download } from 'lucide-react';
import './PageTemplate.css';

interface PageTemplateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  addButtonLabel?: string;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ title, description, icon: Icon, addButtonLabel }) => {
  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-info">
          <div className="header-icon">
            <Icon size={24} />
          </div>
          <div className="header-text">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
        
        {addButtonLabel && (
          <button className="btn-primary">
            <Plus size={18} />
            {addButtonLabel}
          </button>
        )}
      </header>

      <div className="page-toolbar card-premium">
        <div className="toolbar-search">
          <Search size={18} />
          <input type="text" placeholder={`Buscar en ${title.toLowerCase()}...`} />
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary"><Filter size={18} /> Filtrar</button>
          <button className="btn-secondary"><Download size={18} /> Exportar</button>
        </div>
      </div>

      <div className="page-content-grid">
        <div className="card-premium placeholder-empty">
          <div className="empty-state">
            <div className="empty-icon">
              <Icon size={64} />
            </div>
            <h3>Sin datos disponibles</h3>
            <p>Aún no se han registrado {title.toLowerCase()} para este tenant.</p>
            {addButtonLabel && <button className="btn-primary">{addButtonLabel}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTemplate;
