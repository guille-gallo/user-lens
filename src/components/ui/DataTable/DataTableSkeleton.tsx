import React from 'react';
import { useDataTableColumns, useColumnVisibility } from '../../../hooks';
import './DataTable.scss';

interface DataTableSkeletonProps {
  className?: string;
  rowCount?: number;
}

/**
 * DataTableSkeleton - Only skeletonizes the table content, not the controls
 * This preserves user interaction with search, filters, and other controls
 */
export const DataTableSkeleton: React.FC<DataTableSkeletonProps> = ({
  className = '',
  rowCount = 5
}) => {
  // Use the same column logic as the main DataTable to ensure consistent layout
  const allColumns = useDataTableColumns();
  const { getVisibleColumns } = useColumnVisibility(allColumns);
  const visibleColumns = getVisibleColumns();

  return (
    <>
      {/* Desktop table skeleton - only the table content */}
      <div className={`data-table__wrapper ${className}`}>
        <table className="data-table__table" role="table" aria-label="Loading users data">
          <thead className="data-table__header">
            <tr className="data-table__header-row">
              {visibleColumns.map((column) => (
                <th 
                  key={column.key} 
                  className="data-table__header-cell"
                  scope="col"
                >
                  <div className="data-table__skeleton-text data-table__skeleton-text--header"></div>
                </th>
              ))}
              <th className="data-table__header-cell data-table__header-cell--actions" scope="col">
                <div className="data-table__skeleton-text data-table__skeleton-text--header"></div>
              </th>
            </tr>
          </thead>
          <tbody className="data-table__body">
            {Array.from({ length: rowCount }, (_, index) => (
              <tr key={index} className="data-table__row data-table__row--skeleton">
                {visibleColumns.map((column) => (
                  <td key={column.key} className="data-table__cell">
                    <div className="data-table__skeleton-text data-table__skeleton-text--cell"></div>
                  </td>
                ))}
                <td className="data-table__cell data-table__cell--actions">
                  <div className="data-table__skeleton-actions">
                    <div className="data-table__skeleton-button"></div>
                    <div className="data-table__skeleton-button"></div>
                    <div className="data-table__skeleton-button"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards skeleton - only the content */}
      <div className="data-table__mobile-cards">
        {Array.from({ length: rowCount }, (_, index) => (
          <div key={index} className="data-table__card data-table__card--skeleton">
            <div className="data-table__card-header">
              <div className="data-table__card-title">
                <div className="data-table__skeleton-button"></div>
                <div className="data-table__card-info">
                  <div className="data-table__skeleton-text data-table__skeleton-text--name"></div>
                  <div className="data-table__skeleton-text data-table__skeleton-text--username"></div>
                </div>
              </div>
              <div className="data-table__card-actions">
                <div className="data-table__skeleton-button"></div>
                <div className="data-table__skeleton-button"></div>
                <div className="data-table__skeleton-button"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
