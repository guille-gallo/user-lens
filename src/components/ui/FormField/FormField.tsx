import React from 'react';
import './FormField.scss';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

/**
 * Reusable form field wrapper component with label and error handling
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  className = '',
  htmlFor
}) => {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
      <label 
        className="form-field__label"
        htmlFor={htmlFor}
      >
        {label}
        {required && (
          <span className="form-field__required" aria-label="required">
            *
          </span>
        )}
      </label>
      <div className="form-field__input-wrapper">
        {children}
      </div>
      {error && (
        <span 
          className="form-field__error" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </span>
      )}
    </div>
  );
};
