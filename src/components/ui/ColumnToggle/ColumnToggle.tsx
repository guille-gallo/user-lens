import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../Icon';
import './ColumnToggle.scss';

export interface ColumnDefinition {
  key: string;
  label: string;
  visible: boolean;
  essential?: boolean; //cannot be hidden
}

interface ColumnToggleProps {
  columns: ColumnDefinition[];
  onToggle: (columnKey: string) => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
  className?: string;
}

/**
 * Column Toggle component
 */
export const ColumnToggle: React.FC<ColumnToggleProps> = ({
  columns,
  onToggle,
  onSelectAll,
  onUnselectAll,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const visibleCount = columns.filter(col => col.visible).length;
  const totalCount = columns.length;
  const nonEssentialColumns = columns.filter(col => !col.essential);
  const hiddenNonEssentialColumns = nonEssentialColumns.filter(col => !col.visible);
  const allNonEssentialVisible = nonEssentialColumns.length > 0 && hiddenNonEssentialColumns.length === 0;

  const handleToggleAll = () => {
    if (allNonEssentialVisible) {
      onUnselectAll?.();
    } else {
      onSelectAll?.();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // TODO: lift up to higher layer
  // handle dropdown positioning to prevent cutoff:
  useEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef.current) {
      const dropdown = dropdownRef.current.querySelector('.column-toggle__dropdown') as HTMLElement;
      if (dropdown) {
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Check if dropdown would go off-screen to the right
        if (rect.right + dropdownRect.width > viewportWidth) {
          dropdown.style.right = '0';
          dropdown.style.left = 'auto';
        }
        
        // Check if dropdown would go off-screen to the left
        if (rect.left - dropdownRect.width < 0) {
          dropdown.style.left = '0';
          dropdown.style.right = 'auto';
        }
      }
    }
  }, [isOpen]);

  const handleToggle = (columnKey: string, essential?: boolean) => {
    if (essential) return; // Cannot toggle essential columns
    onToggle(columnKey);
    // Keep dropdown open after toggling a column
    //the dropdown will stay open until user clicks outside or closes manually
  };

  const handleKeyDown = (e: React.KeyboardEvent, columnKey: string, essential?: boolean) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle(columnKey, essential);
    }
  };

  const handleToggleAllKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggleAll();
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    // prevent dropdown from closing when clicking inside it
    e.stopPropagation();
  };

  return (
    <div className={`column-toggle ${className}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
        className="column-toggle__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle column visibility"
        title="Customize columns"
      >
        <Icon name="columns" size={16} />
        <span className="column-toggle__label">
          Columns ({visibleCount}/{totalCount})
        </span>
        <Icon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={14} 
          className="column-toggle__chevron"
        />
      </button>

      {isOpen && (
        <div className="column-toggle__dropdown" onClick={handleDropdownClick}>
          <div className="column-toggle__header">
            <h4 className="column-toggle__title">Show/Hide Columns</h4>
            <button
              className="column-toggle__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close columns menu"
              title="Close"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
          
          {/* Toggle All Control */}
          <div className="column-toggle__controls">
            <label className="column-toggle__item">
              <input
                type="checkbox"
                className="column-toggle__checkbox"
                checked={allNonEssentialVisible}
                onChange={handleToggleAll}
                onKeyDown={handleToggleAllKeyDown}
                disabled={nonEssentialColumns.length === 0}
              />
              <span className="column-toggle__checkmark">
                {allNonEssentialVisible && <Icon name="check" size={12} />}
              </span>
              <span className="column-toggle__text">
                Select All
              </span>
            </label>
          </div>
          
          <div className="column-toggle__list">
            {columns.map((column) => (
              <label 
                key={column.key} 
                className={`column-toggle__item ${column.essential ? 'column-toggle__item--essential' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => handleToggle(column.key, column.essential)}
                  onKeyDown={(e) => handleKeyDown(e, column.key, column.essential)}
                  disabled={column.essential}
                  className="column-toggle__checkbox"
                />
                <span className="column-toggle__checkmark">
                  {column.visible && <Icon name="check" size={12} />}
                </span>
                <span className="column-toggle__text">
                  {column.label}
                  {column.essential && (
                    <span className="column-toggle__essential-badge">Required</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
