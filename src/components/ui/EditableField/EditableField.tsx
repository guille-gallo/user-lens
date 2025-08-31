import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import './EditableField.scss';

interface EditableFieldProps {
  label: string;
  value: string | number;
  field: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string | number) => void;
  onCancel: () => void;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number';
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
  type = 'text',
  disabled = false
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = `editable-field-${field}`;
  const editButtonId = `edit-${field}`;
  const saveButtonId = `save-${field}`;
  const cancelButtonId = `cancel-${field}`;

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="editable-field">
      <label htmlFor={fieldId} className="editable-field__label">
        {label}
      </label>
      <div className="editable-field__content">
        {isEditing ? (
          <div className="editable-field__input-wrapper" role="group" aria-labelledby={fieldId}>
            <input
              ref={inputRef}
              id={fieldId}
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="editable-field__input"
              aria-describedby={`${fieldId}-instructions`}
            />
            <div 
              id={`${fieldId}-instructions`} 
              className="editable-field__instructions"
              aria-live="polite"
            >
              Press Enter to save, Escape to cancel
            </div>
            <div className="editable-field__actions">
              <button
                id={saveButtonId}
                onClick={handleSave}
                className="editable-field__save"
                aria-label={`Save changes to ${label}`}
                title="Save changes"
                type="button"
              >
                <Icon name="check" size={18} />
              </button>
              <button
                id={cancelButtonId}
                onClick={onCancel}
                className="editable-field__cancel"
                aria-label={`Cancel editing ${label}`}
                title="Cancel editing"
                type="button"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="editable-field__value-wrapper">
            <span 
              id={fieldId}
              className="editable-field__value"
              aria-live="polite"
            >
              {value}
            </span>
            {!disabled && (
              <button
                id={editButtonId}
                onClick={onEdit}
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
