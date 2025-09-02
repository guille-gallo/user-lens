import React, { useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import './Modal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Modal component for dialogs and forms
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = () => {
    if (!modalRef.current) return [];
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(modalRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Handle Tab key for focus trapping
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Add event listener for keyboard navigation
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
      
      // Focus the modal after a short delay to ensure it's rendered
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else {
            // If no focusable elements, focus the modal itself
            modalRef.current.focus();
          }
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current && !isOpen) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`modal modal--${size} ${className}`}
        tabIndex={-1}
        role="document"
      >
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        
        <div className="modal__body">
          {children}
        </div>
        
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
