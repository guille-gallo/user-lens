import React, { useState } from 'react';
import { Icon } from '../Icon';
import { ColumnToggle } from '../ColumnToggle';
import type { User } from '../../../services/userService';
import { useDataTableColumns, useColumnVisibility, useTableKeyboardNavigation } from '../../../hooks';
import { BUTTON_LABELS, DATA_TABLE } from '../../../constants/ui';
import { ARIA_ROLES, TABLE_NAVIGATION } from '../../../constants/accessibility';
import './DataTable.scss';

type SortOrder = 'asc' | 'desc';

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  essential?: boolean; // Cannot be hidden
  defaultVisible?: boolean;
  render?: (value: any, user: User) => React.ReactNode;
}

interface DataTableProps {
  users: User[];
  loading?: boolean;
  onSort?: (field: string, order: SortOrder) => void;
  sortField?: string | null;
  sortOrder?: SortOrder;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  className?: string;
}

/**
 * DataTable component
 */
export const DataTable: React.FC<DataTableProps> = ({
  users,
  loading = false,
  onSort,
  sortField,
  sortOrder,
  onEdit,
  onDelete,
  onView,
  className = ''
}) => {
  // Use custom hooks for column management
  const allColumns = useDataTableColumns();
  const {
    columnVisibility,
    toggleColumn,
    selectAllColumns,
    unselectAllColumns,
    getVisibleColumns
  } = useColumnVisibility(allColumns);

  // Get visible columns using hook
  const visibleColumns = getVisibleColumns();
  
  // Table keyboard navigation
  const tableId = 'data-table-main';
  const {
    getCellProps,
    announceRegionId
  } = useTableKeyboardNavigation({
    rowCount: users.length,
    columnCount: visibleColumns.length + 1, // +1 for actions column
    tableId
  });

  // Mobile card expansion state
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCardExpansion = (userId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const isCardExpanded = (userId: number) => expandedCards.has(userId);

  const handleSort = (field: string) => {
    if (!onSort) return;
    
    let newOrder: SortOrder = 'asc';
    if (sortField === field && sortOrder === 'asc') {
      newOrder = 'desc';
    }
    
    onSort(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <Icon name="chevrons-up-down" size={14} className="data-table__sort-icon--neutral" />;
    }
    return sortOrder === 'asc' ? 
      <Icon name="chevron-up" size={14} className="data-table__sort-icon--asc" /> : 
      <Icon name="chevron-down" size={14} className="data-table__sort-icon--desc" />;
  };

  const getCellValue = (user: User, column: DataTableColumn) => {
    // Handle nested property access first to get the actual value
    const keys = column.key.split('.');
    let value: any = user;
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (column.render) {
      return column.render(value, user);
    }
    
    return String(value || '');
  };

  if (loading) {
    return (
      <div className={`data-table ${className}`}>
        <div className="data-table__loading">
          <div className="data-table__spinner">⟳</div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={`data-table ${className}`}>
        <div className="data-table__empty">
          <p>No users found</p>
          <small>Try adjusting your search criteria</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      <div className="data-table__toolbar">
        <div className="data-table__toolbar-left">
          <span 
            className="data-table__result-count"
            role="status"
            aria-live="polite"
            tabIndex={0}
            aria-label={`Results summary: ${users.length} users total`}
          >
            {users.length} users total
          </span>
        </div>
        <div className="data-table__toolbar-right">
          <div className="data-table__column-toggle-wrapper">
            <ColumnToggle
              columns={columnVisibility}
              onToggle={toggleColumn}
              onSelectAll={selectAllColumns}
              onUnselectAll={unselectAllColumns}
            />
          </div>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="data-table__wrapper">
        <table 
          id={tableId}
          className="data-table__table" 
          role={ARIA_ROLES.TABLE} 
          aria-label={DATA_TABLE.USERS_DATA_TABLE}
          aria-describedby={announceRegionId}
        >
          <caption className="data-table__caption">
            User information table with {users.length} users. Use column headers to sort data. {TABLE_NAVIGATION.NAVIGATION_HINT}
          </caption>
          <thead>
            <tr role="row">
              {visibleColumns.map((column) => (
                <th 
                  key={column.key} 
                  className="data-table__header-cell"
                  role="columnheader"
                  aria-sort={
                    sortField === column.key 
                      ? sortOrder === 'asc' ? 'ascending' : 'descending'
                      : column.sortable ? 'none' : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      className="data-table__sort-button"
                      onClick={() => handleSort(column.key)}
                      aria-label={`${DATA_TABLE.SORT_BY} ${column.label}${
                        sortField === column.key 
                          ? `, currently ${sortOrder === 'asc' ? DATA_TABLE.ASCENDING : DATA_TABLE.DESCENDING}` 
                          : ''
                      }`}
                      data-sortable="true"
                      data-field={column.key}
                      type="button"
                    >
                      <span>{column.label}</span>
                      <span className="data-table__sort-icon" aria-hidden="true">
                        {getSortIcon(column.key)}
                      </span>
                    </button>
                  ) : (
                    <span data-sortable="false">{column.label}</span>
                  )}
                </th>
              ))}
              <th 
                className="data-table__header-cell data-table__header-cell--actions"
                role="columnheader"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, rowIndex) => (
              <tr key={user.id} className="data-table__row" role="row">
                {visibleColumns.map((column, columnIndex) => {
                  const cellContent = getCellValue(user, column);
                  // Check if this column uses a render function (returns JSX) or plain text
                  const hasRenderFunction = column.render !== undefined;
                  
                  return (
                    <td 
                      key={column.key} 
                      className="data-table__cell data-table__cell--navigable"
                      role="cell"
                      {...getCellProps(rowIndex, columnIndex)}
                    >
                      {hasRenderFunction ? (
                        // For rendered content (links, etc), use as-is but ensure it's in a container
                        <div className="data-table__cell-content">
                          {cellContent}
                        </div>
                      ) : (
                        // For plain text content, wrap in span
                        <span className="data-table__cell-content">
                          {cellContent}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td 
                  className="data-table__cell data-table__cell--actions data-table__cell--navigable" 
                  role="cell"
                  {...getCellProps(rowIndex, visibleColumns.length)}
                >
                  <div className="data-table__actions" role="group" aria-label={`Actions for ${user.name}`}>
                    {onView && (
                      <button
                        className="data-table__action-btn data-table__action-btn--view"
                        onClick={() => onView(user)}
                        aria-label={`View details for ${user.name}`}
                        title={BUTTON_LABELS.VIEW_DETAILS}
                        type="button"
                      >
                        <Icon name="eye" size={16} />
                        <span className="data-table__action-text">View</span>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="data-table__action-btn data-table__action-btn--edit"
                        onClick={() => onEdit(user)}
                        aria-label={`Edit ${user.name}`}
                        title={BUTTON_LABELS.EDIT_USER}
                        type="button"
                      >
                        <Icon name="edit" size={16} />
                        <span className="data-table__action-text">{BUTTON_LABELS.EDIT}</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="data-table__action-btn data-table__action-btn--delete"
                        onClick={() => onDelete(user)}
                        aria-label={`Delete ${user.name}`}
                        title={BUTTON_LABELS.DELETE_USER}
                        type="button"
                      >
                        <Icon name="trash" size={16} />
                        <span className="data-table__action-text">{BUTTON_LABELS.DELETE}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Screen reader announcements for navigation */}
        <div 
          id={announceRegionId}
          className="data-table__announce"
          aria-live="polite" 
          aria-atomic="true"
        >
          {/* Dynamic announcements will be inserted here */}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="data-table__mobile-cards">
        {users.map((user) => {
          const expanded = isCardExpanded(user.id);
          
          return (
            <div key={user.id} className={`data-table__card ${expanded ? 'data-table__card--expanded' : ''}`}>
              <div className="data-table__card-header">
                <div className="data-table__card-title">
                  <h3 className="data-table__card-name">{user.name}</h3>
                  <span className="data-table__card-username">@{user.username}</span>
                </div>
                <div className="data-table__card-actions">
                  <button
                    className="data-table__card-expand"
                    onClick={() => toggleCardExpansion(user.id)}
                    aria-label={expanded ? `Collapse ${user.name} details` : `Expand ${user.name} details`}
                    title={expanded ? "Show less" : "Show more"}
                  >
                    <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} />
                  </button>
                  {onView && (
                    <button
                      className="data-table__card-action data-table__card-action--view"
                      onClick={() => onView(user)}
                      aria-label={`View ${user.name} details`}
                      title="View details"
                    >
                      <Icon name="eye" size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="data-table__card-action data-table__card-action--edit"
                      onClick={() => onEdit(user)}
                      aria-label={`Edit ${user.name}`}
                      title="Edit user"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="data-table__card-action data-table__card-action--delete"
                      onClick={() => onDelete(user)}
                      aria-label={`Delete ${user.name}`}
                      title="Delete user"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="data-table__card-content">
                {/* Essential fields - always visible */}
                <div className="data-table__card-essential">
                  <div className="data-table__card-field">
                    <span className="data-table__card-label">Email</span>
                    <a 
                      href={`mailto:${user.email}`} 
                      className="data-table__card-value data-table__card-value--link"
                    >
                      {user.email}
                    </a>
                  </div>
                  
                  <div className="data-table__card-field">
                    <span className="data-table__card-label">Company</span>
                    <span className="data-table__card-value">{user.company.name}</span>
                  </div>
                </div>

                {/* Expandable fields - shown when expanded */}
                <div className={`data-table__card-expandable ${expanded ? 'data-table__card-expandable--visible' : ''}`}>
                  <div className="data-table__card-field">
                    <span className="data-table__card-label">Phone</span>
                    <a 
                      href={`tel:${user.phone}`} 
                      className="data-table__card-value data-table__card-value--link"
                    >
                      {user.phone}
                    </a>
                  </div>
                  
                  <div className="data-table__card-field">
                    <span className="data-table__card-label">Website</span>
                    <a 
                      href={`https://${user.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="data-table__card-value data-table__card-value--link"
                    >
                      {user.website} ↗
                    </a>
                  </div>
                  
                  <div className="data-table__card-field">
                    <span className="data-table__card-label">Address</span>
                    <span className="data-table__card-value">
                      {user.address.street} {user.address.suite}, {user.address.city} {user.address.zipcode}
                    </span>
                  </div>
                  
                  <div className="data-table__card-field">
                    <span className="data-table__card-label">Catch Phrase</span>
                    <span className="data-table__card-value">"{user.company.catchPhrase}"</span>
                  </div>
                  
                  <div className="data-table__card-field">
                    <span className="data-table__card-label">Business</span>
                    <span className="data-table__card-value">{user.company.bs}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
