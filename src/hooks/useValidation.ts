/**
 * Validation Hook
 * Provides consistent validation state management across components
 */

import { useState, useCallback } from 'react';
import { validateField, validateForm, type FieldValidationConfig } from '../utils/validation';

export const useValidation = (config: FieldValidationConfig) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates a single field and updates error state
   */
  const validateSingleField = useCallback((fieldName: string, value: any): string | null => {
    const rules = config[fieldName];
    if (!rules) return null;

    const error = validateField(value, rules);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));

    return error;
  }, [config]);

  /**
   * Validates entire form data and updates error state
   */
  const validateFormData = useCallback((data: Record<string, any>): boolean => {
    const newErrors = validateForm(data, config);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config]);

  /**
   * Clears error for a specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  }, []);

  /**
   * Clears all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Checks if a field has validation rules
   */
  const hasValidation = useCallback((fieldName: string): boolean => {
    return !!(config[fieldName] && config[fieldName].length > 0);
  }, [config]);

  return {
    errors,
    validateField: validateSingleField,
    validateForm: validateFormData,
    clearFieldError,
    clearAllErrors,
    hasValidation
  };
};
