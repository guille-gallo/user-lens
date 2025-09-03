import React from 'react';
import { Link } from 'react-router-dom';
import { ARIA_LABELS } from '../../../constants/accessibility';
import './Header.scss';

export interface HeaderProps {
  /**
   * The application title/name displayed in the header
   */
  title?: string;
  /**
   * URL for the home/root link (defaults to "/")
   */
  homeUrl?: string;
  /**
   * Action buttons or elements to display in the header
   */
  actions?: React.ReactNode;
  /**
   * Notification component or element
   */
  notifications?: React.ReactNode;
  /**
   * Additional CSS class name for styling
   */
  className?: string;
  /**
   * ARIA label for home navigation link
   */
  homeAriaLabel?: string;
  /**
   * ARIA label for primary navigation
   */
  navigationAriaLabel?: string;
}

/**
 * Generic Header Component
 * 
 * A reusable header component that follows composition patterns.
 * Accepts title, actions, and notifications as props to remain generic
 * and reusable across different pages and contexts.
 */
export const Header: React.FC<HeaderProps> = ({
  title = 'User Lens',
  homeUrl = '/',
  actions,
  notifications,
  className = '',
  homeAriaLabel = ARIA_LABELS.HOME_NAVIGATION,
  navigationAriaLabel = ARIA_LABELS.PRIMARY_NAVIGATION
}) => {
  return (
    <header className={`header ${className}`.trim()} role="banner">
      <div className="header__content">
        <h1 className="header__title">
          <Link 
            to={homeUrl} 
            className="header__title-link"
            aria-label={homeAriaLabel}
          >
            {title}
          </Link>
        </h1>
        
        <nav 
          className="header__navigation" 
          role="navigation" 
          aria-label={navigationAriaLabel}
        >
          {actions && (
            <div className="header__actions">
              {actions}
            </div>
          )}
          
          {notifications && (
            <div className="header__notifications">
              {notifications}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
