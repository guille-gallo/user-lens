import { useState, useCallback } from 'react';
import type { User } from '../services/userService';

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
  const [isLoading, setIsLoading] = useState(false);

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
  const handleSaveField = useCallback(async (field: string, value: string | number): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const updatedUser = updateNestedField(user, field, value);
      await onUpdate(user.id, updatedUser);
      setEditingField(null);
      setEditValues({});
      return true;
    } catch (error) {
      console.error('Failed to update field:', error);
      return false;
    } finally {
      setIsLoading(false);
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
    isLoading,
    handleEditField,
    handleSaveField,
    handleCancelEdit
  };
};

/**
 * Utility: Get value from nested field path
 */
function getNestedFieldValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
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
    return {
      [parent]: {
        ...(user as any)[parent],
        [child]: value
      }
    };
  }
  
  if (fieldParts.length === 3) {
    // Double nested field update (e.g., "address.geo.lat")
    const [parent, nested, child] = fieldParts;
    return {
      [parent]: {
        ...(user as any)[parent],
        [nested]: {
          ...(user as any)[parent][nested],
          [child]: value
        }
      }
    };
  }
  
  throw new Error(`Unsupported field path depth: ${field}`);
}
