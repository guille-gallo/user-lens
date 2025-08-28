import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * loading Spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  className = ''
}) => {
  return (
    <div 
      className={`loading-spinner loading-spinner--${size} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-spinner__icon" aria-hidden="true">
        ⟳
      </div>
      <span className="loading-spinner__message">
        {message}
      </span>
    </div>
  );
};
