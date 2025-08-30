import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from '../Button';
import { Icon } from '../Icon';
import './ErrorBoundary.scss';

/**
 * Error Boundary component for React Router
 */
export const ErrorBoundary: React.FC = () => {
  const error = useRouteError();

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetry = () => {
    window.location.reload();
  };

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = '';

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="error-boundary" role="alert">
      <div className="error-boundary__content">
        <div className="error-boundary__icon" aria-hidden="true">
          <Icon name="warning" size={48} />
        </div>
        
        <h1 className="error-boundary__title">
          Oops! Something went wrong
        </h1>
        
        {errorStatus && (
          <p className="error-boundary__status">
            {errorStatus}
          </p>
        )}
        
        <p className="error-boundary__message">
          {errorMessage}
        </p>
        
        <div className="error-boundary__actions">
          <Button variant="primary" onClick={handleGoHome}>
            Go Home
          </Button>
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};
