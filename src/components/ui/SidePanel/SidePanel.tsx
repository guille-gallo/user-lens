import React, { useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import './SidePanel.scss';

export interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Side Panel component for desktop editing interfaces
 * Provides contextual editing without losing the main view
 */
export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'medium',
  className = ''
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElement = panelRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`side-panel-overlay ${className}`}>
      <div 
        className={`side-panel side-panel--${size}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-panel-title"
        aria-describedby={subtitle ? "side-panel-subtitle" : undefined}
      >
        {/* Header */}
        <div className="side-panel__header">
          <div className="side-panel__header-content">
            <h2 id="side-panel-title" className="side-panel__title">
              {title}
            </h2>
            {subtitle && (
              <p id="side-panel-subtitle" className="side-panel__subtitle">
                {subtitle}
              </p>
            )}
          </div>
          <button
            className="side-panel__close"
            onClick={onClose}
            aria-label="Close panel"
            title="Close panel"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="side-panel__body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="side-panel__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
