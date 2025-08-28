import React, { useState, useEffect } from 'react';
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
  field: _field, // unused but kept for potential future use
  isEditing,
  onEdit,
  onSave,
  onCancel,
  type = 'text',
  disabled = false
}) => {
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="editable-field">
      <label className="editable-field__label">{label}</label>
      <div className="editable-field__content">
        {isEditing ? (
          <div className="editable-field__input-wrapper">
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="editable-field__input"
              autoFocus
            />
            <div className="editable-field__actions">
              <button
                onClick={handleSave}
                className="editable-field__save"
                title="Save changes"
              >
                <Icon name="check" size={18} />
              </button>
              <button
                onClick={onCancel}
                className="editable-field__cancel"
                title="Cancel editing"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="editable-field__value-wrapper">
            <span className="editable-field__value">{value}</span>
            {!disabled && (
              <button
                onClick={onEdit}
                className="editable-field__edit"
                title="Edit"
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
