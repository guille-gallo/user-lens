import React, { memo, useMemo, useCallback } from 'react';
import { Icon } from '../Icon';
import { ColumnToggle } from '../ColumnToggle';
import { DataTableDesktop } from './DataTableDesktop';
import { DataTableMobile } from './DataTableMobile';
import { useDataTableColumns, useColumnVisibility } from '../../../hooks';
import { getNestedValue } from '../../../utils';
import type { DataTableProps, DataTableColumn, SortOrder } from './DataTableTypes';
import type { User } from '../../../types';
import './DataTable.scss';

/**
 * DataTable - Main orchestrator component
 * Follows Composition over Inheritance pattern
 * Delegates desktop/mobile rendering to specialized components
 * Handles shared business logic and state management
 */
const DataTableComponent: React.FC<DataTableProps> = ({
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

  // Memoize visible columns to prevent recalculation on every render
  const visibleColumns = useMemo(() => getVisibleColumns(), [getVisibleColumns]);

  // Memoized sort handler to prevent child re-renders
  const handleSort = useCallback((field: string) => {
    if (!onSort) return;
    
    let newOrder: SortOrder = 'asc';
    if (sortField === field && sortOrder === 'asc') {
      newOrder = 'desc';
    }
    
    onSort(field, newOrder);
  }, [onSort, sortField, sortOrder]);

  // Memoized sort icon function
  const getSortIcon = useCallback((field: string) => {
    if (sortField !== field) {
      return <Icon name="chevrons-up-down" size={14} className="data-table__sort-icon--neutral" />;
    }
    return sortOrder === 'asc' ? 
      <Icon name="chevron-up" size={14} className="data-table__sort-icon--asc" /> : 
      <Icon name="chevron-down" size={14} className="data-table__sort-icon--desc" />;
  }, [sortField, sortOrder]);

  // Memoized cell value function
  const getCellValue = useCallback((user: User, column: DataTableColumn) => {
    // Use centralized utility for nested property access
    const value = getNestedValue(user, column.key);
    
    if (column.render) {
      return column.render(value, user);
    }
    
    return String(value || '');
  }, []);

  // Loading state
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

  // Empty state
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

  // Main render - compose desktop and mobile views
  return (
    <div className={`data-table ${className}`}>
      {/* Shared toolbar */}
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
      
      {/* Desktop View - CSS controls visibility */}
      <DataTableDesktop
        users={users}
        visibleColumns={visibleColumns}
        allColumns={allColumns}
        sortField={sortField}
        sortOrder={sortOrder}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        handleSort={handleSort}
        getSortIcon={getSortIcon}
        getCellValue={getCellValue}
      />

      {/* Mobile View - CSS controls visibility */}
      <DataTableMobile
        users={users}
        visibleColumns={visibleColumns}
        allColumns={allColumns}
        sortField={sortField}
        sortOrder={sortOrder}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    </div>
  );
};

export const DataTable = memo(DataTableComponent);
