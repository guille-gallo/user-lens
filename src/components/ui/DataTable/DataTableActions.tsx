import React from 'react';
import { Icon } from '../Icon';
import { BUTTON_LABELS } from '../../../constants/ui';
import type { DataTableActionsProps } from './DataTableTypes';

/**
 * DataTableActions - Reusable action buttons for both desktop and mobile views
 * Follows Single Responsibility Principle
 */
export const DataTableActions: React.FC<DataTableActionsProps> = ({
  user,
  onView,
  onEdit,
  onDelete,
  variant = 'desktop'
}) => {
  const isDesktop = variant === 'desktop';
  const baseClass = isDesktop ? 'data-table__action-btn' : 'data-table__card-action';
  
  return (
    <div 
      className={isDesktop ? 'data-table__actions' : 'data-table__card-actions'} 
      role="group" 
      aria-label={`Actions for ${user.name}`}
    >
      {onView && (
        <button
          className={`${baseClass} ${baseClass}--view`}
          onClick={() => onView(user)}
          aria-label={`View details for ${user.name}`}
          title={BUTTON_LABELS.VIEW_DETAILS}
          type="button"
        >
          <Icon name="eye" size={16} />
          {isDesktop && <span className="data-table__action-text">View</span>}
        </button>
      )}
      {onEdit && (
        <button
          className={`${baseClass} ${baseClass}--edit`}
          onClick={() => onEdit(user)}
          aria-label={`Edit ${user.name}`}
          title={isDesktop ? BUTTON_LABELS.EDIT_USER : "Edit user"}
          type="button"
        >
          <Icon name="edit" size={16} />
          {isDesktop && <span className="data-table__action-text">{BUTTON_LABELS.EDIT}</span>}
        </button>
      )}
      {onDelete && (
        <button
          className={`${baseClass} ${baseClass}--delete`}
          onClick={() => onDelete(user)}
          aria-label={`Delete ${user.name}`}
          title={isDesktop ? BUTTON_LABELS.DELETE_USER : "Delete user"}
          type="button"
        >
          <Icon name="trash" size={16} />
          {isDesktop && <span className="data-table__action-text">{BUTTON_LABELS.DELETE}</span>}
        </button>
      )}
    </div>
  );
};
