import React from 'react';
import { DataTableActions } from './DataTableActions';
import { useTableKeyboardNavigation } from '../../../hooks';
import { DATA_TABLE } from '../../../constants/ui';
import { ARIA_ROLES, TABLE_NAVIGATION } from '../../../constants/accessibility';
import type { DataTableColumn } from './DataTableTypes';
import type { User } from '../../../types';

interface DataTableDesktopProps {
  users: User[];
  visibleColumns: DataTableColumn[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  handleSort: (field: string) => void;
  getSortIcon: (field: string) => React.ReactNode;
  getCellValue: (user: User, column: DataTableColumn) => React.ReactNode;
  isShowingSkeleton?: boolean;
  pageSize?: number;
}

/**
 * DataTableDesktop - Desktop table view component
 * Handles table rendering, sorting, and keyboard navigation
 * Follows Single Responsibility Principle - only handles desktop table view
 */
export const DataTableDesktop: React.FC<DataTableDesktopProps> = ({
  users,
  visibleColumns,
  sortField,
  sortOrder,
  onEdit,
  onDelete,
  onView,
  handleSort,
  getSortIcon,
  getCellValue,
  isShowingSkeleton = false,
  pageSize = 15
}) => {
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

  return (
    <div className="data-table__wrapper">
      <table 
        id={tableId}
        className="data-table__table" 
        role={ARIA_ROLES.TABLE} 
        aria-label={DATA_TABLE.USERS_DATA_TABLE}
        aria-describedby={announceRegionId}
        style={{ '--expected-rows': pageSize } as React.CSSProperties}
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
                data-field={column.key}
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
          {isShowingSkeleton ? (
            // Skeleton rows - use pageSize to prevent layout shift
            Array.from({ length: pageSize }, (_, index) => (
              <tr key={`skeleton-${index}`} className="data-table__row data-table__row--skeleton" role="row">
                {visibleColumns.map((column) => (
                  <td 
                    key={column.key} 
                    className="data-table__cell" 
                    role="cell"
                    data-field={column.key}
                  >
                    <div className="data-table__skeleton-placeholder data-table__skeleton-placeholder--cell"></div>
                  </td>
                ))}
                <td className="data-table__cell data-table__cell--actions" role="cell">
                  <div className="data-table__skeleton-actions">
                    <div className="data-table__skeleton-placeholder data-table__skeleton-placeholder--button"></div>
                    <div className="data-table__skeleton-placeholder data-table__skeleton-placeholder--button"></div>
                    <div className="data-table__skeleton-placeholder data-table__skeleton-placeholder--button"></div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            // Real user data rows + empty rows to maintain consistent height
            <>
              {users.map((user, rowIndex) => (
                <tr key={user.id} className="data-table__row" role="row">
                {visibleColumns.map((column, columnIndex) => {
                  const cellContent = getCellValue(user, column);
                  // Check if this column uses a render function (returns JSX) or plain text
                  const hasRenderFunction = column.render !== undefined;
                  // Get text content for tooltip - if render function, try to extract text
                  const textContent = hasRenderFunction ? 
                    (typeof cellContent === 'string' ? cellContent : '') : 
                    String(cellContent || '');
                  
                  return (
                    <td 
                      key={column.key} 
                      className="data-table__cell data-table__cell--navigable"
                      role="cell"
                      data-field={column.key}
                      {...getCellProps(rowIndex, columnIndex)}
                    >
                      {hasRenderFunction ? (
                        // For rendered content (links, etc), use as-is but ensure it's in a container
                        <div className="data-table__cell-content" title={textContent}>
                          {cellContent}
                        </div>
                      ) : (
                        // For plain text content, wrap in span with tooltip
                        <span className="data-table__cell-content" title={textContent}>
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
                  <DataTableActions
                    user={user}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    variant="desktop"
                  />
                </td>
              </tr>
              ))}
              
              {/* Add empty rows to maintain consistent table height */}
              {Array.from({ length: Math.max(0, pageSize - users.length) }, (_, index) => (
                <tr key={`empty-${index}`} className="data-table__row data-table__row--empty" role="row">
                  {visibleColumns.map((column) => (
                    <td 
                      key={column.key} 
                      className="data-table__cell" 
                      role="cell"
                      data-field={column.key}
                    >
                      &nbsp;
                    </td>
                  ))}
                  <td className="data-table__cell data-table__cell--actions" role="cell">
                    &nbsp;
                  </td>
                </tr>
              ))}
            </>
          )}
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
  );
};
