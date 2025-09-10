import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import './Pagination.scss';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onNext: () => void;
  onPrev: () => void;
  loading?: boolean;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  hasNext,
  hasPrev,
  onPageChange,
  onPageSizeChange,
  onNext,
  onPrev,
  loading = false,
  className = '',
}) => {
  // Calculate which page numbers to show using USWDS 7-slot pattern
  const getVisiblePages = () => {
    const maxSlots = 7;
    const result: (number | string)[] = [];

    // If total pages <= 7, show all pages
    if (totalPages <= maxSlots) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
      return result;
    }

    // Always include first page
    result.push(1);

    // Determine the range around current page
    let start: number;
    let end: number;

    if (currentPage <= 4) {
      // Current page is near the beginning
      start = 2;
      end = 5;
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      if (totalPages > 6) {
        result.push('...');
      }
      if (totalPages > 5) {
        result.push(totalPages);
      }
    } else if (currentPage >= totalPages - 3) {
      // Current page is near the end
      if (totalPages > 5) {
        result.push('...');
      }
      start = totalPages - 4;
      end = totalPages - 1;
      for (let i = start; i <= end; i++) {
        if (i > 1) {
          result.push(i);
        }
      }
      result.push(totalPages);
    } else {
      // Current page is in the middle
      result.push('...');
      result.push(currentPage - 1);
      result.push(currentPage);
      result.push(currentPage + 1);
      result.push('...');
      result.push(totalPages);
    }

    return result;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) {
    return null; // Don't show pagination for single page
  }

  return (
    <div className={`pagination ${className}`} role="navigation" aria-label="Pagination navigation">
      {/* Results summary */}
      <div className="pagination__summary">
        <span className="pagination__summary-text">
          Showing {startItem}-{endItem} of {totalItems} results
        </span>
        
        {/* Page size selector */}
        <div className="pagination__page-size">
          <label htmlFor="pageSize" className="pagination__page-size-label">
            Show:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="pagination__page-size-select"
            disabled={loading}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="pagination__controls">
        {/* Previous button */}
        <Button
          variant="outline"
          size="small"
          onClick={onPrev}
          disabled={!hasPrev || loading}
          className="pagination__button pagination__button--prev"
          aria-label="Go to previous page"
        >
          <Icon name="chevron-left" size={16} />
          Previous
        </Button>

        {/* Page numbers */}
        <div className="pagination__pages" role="group" aria-label="Page numbers">
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} className="pagination__dots" aria-hidden="true">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? 'primary' : 'outline'}
                size="small"
                onClick={() => onPageChange(page as number)}
                disabled={loading}
                className="pagination__button pagination__button--page"
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="small"
          onClick={onNext}
          disabled={!hasNext || loading}
          className="pagination__button pagination__button--next"
          aria-label="Go to next page"
        >
          Next
          <Icon name="chevron-right" size={16} />
        </Button>
      </div>
    </div>
  );
};
