import React, { useEffect, useState } from 'react';
import './Toast.scss';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

/**
 * Toast Notification Component
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 4000,
  onClose,
  isVisible
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to trigger enter animation
      setTimeout(() => setIsAnimating(true), 10);
      
      // Auto-dismiss timer
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for exit animation to complete before unmounting
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`toast toast--${type} ${isAnimating ? 'toast--visible' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__content">
        <span className="toast__icon" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="toast__message">
          {message}
        </span>
      </div>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};
