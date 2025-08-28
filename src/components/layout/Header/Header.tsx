import React from 'react';
import './Header.scss';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Header component
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  actions,
  className = ""
}) => {
  return (
    <header className={`header ${className}`}>
      <div className="header__content">
        <div className="header__text">
          <h1 className="header__title">{title}</h1>
          {subtitle && (
            <p className="header__subtitle">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="header__actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};
