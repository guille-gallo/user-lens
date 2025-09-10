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

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

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
  // Calculate which page numbers to show - simplified pattern for better UX
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

    // Determine if we need ellipsis after first page
    if (currentPage > 4) {
      result.push('...');
    }

    // Add pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        result.push(i);
      }
    }

    // Determine if we need ellipsis before last page
    if (currentPage < totalPages - 3) {
      result.push('...');
    }

    // Always include last page (if more than 1 page)
    if (totalPages > 1) {
      result.push(totalPages);
    }

    return result;
  };

  const visiblePages = getVisiblePages();
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`pagination ${className}`}>
      <div className="pagination__info">
        <span className="pagination__summary">
          Showing {start}–{end} of {totalItems} results
        </span>
        <div className="pagination__page-size">
          <label htmlFor="page-size-select" className="pagination__page-size-label">
            Show
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="pagination__page-size-select"
            disabled={loading}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="pagination__page-size-label">per page</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination__controls">
          {/* Previous Button */}
          <Button
            variant="secondary"
            size="small"
            onClick={onPrev}
            disabled={!hasPrev || loading}
            className="pagination__nav-btn"
            aria-label="Go to previous page"
          >
            <Icon name="chevron-left" size={16} />
          </Button>

          {/* Page Numbers */}
          <div className="pagination__pages">
            {visiblePages.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="pagination__ellipsis">
                    …
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`pagination__page-btn ${isActive ? 'pagination__page-btn--active' : ''}`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="secondary"
            size="small"
            onClick={onNext}
            disabled={!hasNext || loading}
            className="pagination__nav-btn"
            aria-label="Go to next page"
          >
            <Icon name="chevron-right" size={16} />
          </Button>

          {/* Quick Jump to Last Page */}
          {totalPages > 7 && currentPage < totalPages - 2 && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onPageChange(totalPages)}
              disabled={loading}
              className="pagination__jump-btn"
              aria-label={`Go to last page (${totalPages})`}
            >
              <Icon name="chevron-right" size={16} />
              <Icon name="chevron-right" size={16} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
