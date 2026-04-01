import React from 'react';
import './Badge.css';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'secondary', className = '' }) => {
  return (
    <span className={`badge-ui badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
