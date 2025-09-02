import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import { USER_FIELD_CONFIG } from '../../../constants/fieldConfig';
import { validateField } from '../../../utils/validation';
import './EditableField.scss';

interface EditableFieldProps {
  label: string;
  value: string | number;
  field: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string | number) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  field,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  disabled = false
}) => {
  const [editValue, setEditValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = `editable-field-${field}`;

  // Check if field is required
  const isRequired = () => {
    const fieldConfig = USER_FIELD_CONFIG[field];
    return fieldConfig?.some(rule => rule.required) || false;
  };

  // Validate field value
  const validateValue = (value: string | number) => {
    const fieldConfig = USER_FIELD_CONFIG[field];
    if (!fieldConfig) return null;
    return validateField(value, fieldConfig);
  };

  useEffect(() => {
    setEditValue(value);
    setValidationError(null);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Use preventScroll to avoid page movement
      inputRef.current.focus({ preventScroll: true });
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const error = validateValue(editValue);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleCancel = () => {
    setValidationError(null);
    onCancel();
  };

  return (
    <div className="editable-field" data-field={field}>
      <label htmlFor={fieldId} className="editable-field__label">
        {label}
        {isRequired() && <span className="editable-field__required">*</span>}
      </label>
      <div className="editable-field__content">
        {isEditing ? (
          <div className="editable-field__input-wrapper" role="group" aria-labelledby={fieldId}>
            <div className="editable-field__input-container">
              <input
                ref={inputRef}
                id={fieldId}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="editable-field__input"
                aria-describedby={`${fieldId}-instructions`}
                autoComplete="off"
              />
              <div className="editable-field__actions">
                <button
                  onClick={handleSave}
                  className="editable-field__save"
                  aria-label={`Save changes to ${label}`}
                  title="Save changes"
                  type="button"
                >
                  <Icon name="check" size={18} />
                </button>
                <button
                  onClick={handleCancel}
                  className="editable-field__cancel"
                  aria-label={`Cancel editing ${label}`}
                  title="Cancel editing"
                  type="button"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>
            {validationError && (
              <div className="editable-field__error" role="alert" aria-live="polite">
                {validationError}
              </div>
            )}
            <div 
              id={`${fieldId}-instructions`} 
              className="editable-field__instructions"
              aria-live="polite"
            >
              Press Enter to save, Escape to cancel
            </div>
          </div>
        ) : (
          <div 
            className="editable-field__value-wrapper"
            onClick={!disabled ? onEdit : undefined}
            role={!disabled ? "button" : undefined}
            tabIndex={!disabled ? 0 : undefined}
            onKeyDown={!disabled ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEdit();
              }
            } : undefined}
            aria-label={!disabled ? `Click to edit ${label}` : undefined}
          >
            <span 
              id={fieldId}
              className="editable-field__value"
              aria-live="polite"
            >
              {value}
            </span>
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="editable-field__edit"
                aria-label={`Edit ${label}`}
                title={`Edit ${label}`}
                type="button"
              >
                <Icon name="edit3" size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
