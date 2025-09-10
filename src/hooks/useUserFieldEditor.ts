import { useState, useCallback } from 'react';
import type { User } from '../types';
import { USER_FIELD_CONFIG } from '../constants/fieldConfig';
import { validateField } from '../utils/validation';

/**
 * Custom hook for managing user field editing operations
 * Extracts complex nested field update logic from components
 */
export const useUserFieldEditor = (
  user: User | null,
  onUpdate: (id: number, userData: Partial<User>) => Promise<void>
) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<User>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Start editing a field
   */
  const handleEditField = useCallback((field: string) => {
    if (!user) return;
    setEditingField(field);
    
    // Get current field value, handling nested fields
    const currentValue = getNestedFieldValue(user, field);
    setEditValues({ ...editValues, [field]: currentValue });
  }, [user, editValues]);

  /**
   * Save field changes with proper nested object handling
   */
  const handleSaveField = useCallback(async (field: string, value: any): Promise<boolean> => {
    if (!user) return false;

    // Frontend validation using unified system
    const fieldConfig = USER_FIELD_CONFIG[field as keyof typeof USER_FIELD_CONFIG];
    if (fieldConfig) {
      const error = validateField(value, fieldConfig);
      if (error) {
        console.error('Validation error:', error);
        return false;
      }
    }

    try {
      setIsSubmitting(true);
      
      const updatedUser = updateNestedField(user, field, value);
      console.log('🔧 Field Editor - Field:', field, 'Value:', value);
      console.log('🔧 Field Editor - Partial update object:', updatedUser);
      await onUpdate(user.id, updatedUser);
      
      setEditingField(null);
      return true;
    } catch (error) {
      console.error('Error saving field:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, onUpdate]);

  /**
   * Cancel editing operation
   */
  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValues({});
  }, []);

  return {
    editingField,
    editValues,
    isSubmitting,
    handleEditField,
    handleSaveField,
    handleCancelEdit
  };
};

/**
 * Utility: Get value from nested field path
 */
function getNestedFieldValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' && key in current 
      ? (current as Record<string, unknown>)[key] 
      : undefined;
  }, obj);
}

/**
 * Utility: Update nested field in immutable way
 */
function updateNestedField(user: User, field: string, value: string | number): Partial<User> {
  const fieldParts = field.split('.');
  
  if (fieldParts.length === 1) {
    // Simple field update
    return { [field]: value };
  }
  
  if (fieldParts.length === 2) {
    // Nested field update (e.g., "address.city")
    const [parent, child] = fieldParts;
    const parentValue = (user as unknown as Record<string, unknown>)[parent];
    return {
      [parent]: {
        ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
        [child]: value
      }
    };
  }

  if (fieldParts.length === 3) {
    // Double nested field update (e.g., "address.geo.lat")
    const [parent, nested, child] = fieldParts;
    const parentValue = (user as unknown as Record<string, unknown>)[parent];
    const nestedValue = typeof parentValue === 'object' && parentValue !== null 
      ? (parentValue as Record<string, unknown>)[nested] 
      : {};
    return {
      [parent]: {
        ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
        [nested]: {
          ...(typeof nestedValue === 'object' && nestedValue !== null ? nestedValue : {}),
          [child]: value
        }
      }
    };
  }

  throw new Error(`Unsupported field path depth: ${field}`);
}
