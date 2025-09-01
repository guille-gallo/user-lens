/**
 * Unified Validation System
 * Provides consistent validation across all forms in the application
 */

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  message: string;
  validate?: (value: any) => boolean;
}

export interface FieldValidationConfig {
  [fieldName: string]: ValidationRule[];
}

/**
 * Validates a single field against its validation rules
 */
export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  if (!rules || rules.length === 0) return null;

  for (const rule of rules) {
    // Check required rule
    if (rule.required && (!value || String(value).trim() === '')) {
      return rule.message;
    }

    // Skip other validations if value is empty and not required
    if (!value || String(value).trim() === '') {
      continue;
    }

    // Check pattern rule
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message;
    }

    // Check custom validation function
    if (rule.validate && !rule.validate(value)) {
      return rule.message;
    }
  }

  return null;
};

/**
 * Validates an entire form data object against field configuration
 */
export const validateForm = (
  data: Record<string, any>, 
  config: FieldValidationConfig
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const [fieldName, rules] of Object.entries(config)) {
    const fieldValue = getNestedValue(data, fieldName);
    const error = validateField(fieldValue, rules);
    
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
};

/**
 * Gets nested value from object using dot notation (e.g., "address.street")
 */
const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};
