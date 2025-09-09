import { render, screen } from '@testing-library/react';
import { DataTableSkeleton } from '../DataTableSkeleton';

// Mock the hooks since they depend on larger context
jest.mock('../../../../hooks', () => ({
  useDataTableColumns: () => [
    { key: 'name', label: 'Name', sortable: true, essential: true, defaultVisible: true },
    { key: 'email', label: 'Email', sortable: true, defaultVisible: true },
    { key: 'company.name', label: 'Company', sortable: true, defaultVisible: true }
  ],
  useColumnVisibility: () => ({
    getVisibleColumns: () => [
      { key: 'name', label: 'Name', sortable: true, essential: true, defaultVisible: true },
      { key: 'email', label: 'Email', sortable: true, defaultVisible: true },
      { key: 'company.name', label: 'Company', sortable: true, defaultVisible: true }
    ]
  })
}));

describe('DataTableSkeleton', () => {
  describe('Basic Rendering', () => {
    it('should render skeleton table structure', () => {
      render(<DataTableSkeleton />);
      
      // Check for table elements
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading users data')).toBeInTheDocument();
      
      // Check for skeleton elements
      expect(document.querySelector('.data-table__skeleton-text')).toBeInTheDocument();
      expect(document.querySelector('.data-table__row--skeleton')).toBeInTheDocument();
    });

    it('should render correct number of skeleton rows', () => {
      const rowCount = 8;
      render(<DataTableSkeleton rowCount={rowCount} />);
      
      const skeletonRows = document.querySelectorAll('.data-table__row--skeleton');
      expect(skeletonRows).toHaveLength(rowCount);
    });

    it('should render with custom className', () => {
      const customClass = 'custom-skeleton';
      const { container } = render(<DataTableSkeleton className={customClass} />);
      
      expect(container.firstChild).toHaveClass('data-table', customClass);
    });

    it('should render skeleton buttons for actions', () => {
      render(<DataTableSkeleton />);
      
      const skeletonActions = document.querySelectorAll('.data-table__skeleton-actions');
      expect(skeletonActions.length).toBeGreaterThan(0);
      
      const skeletonButtons = document.querySelectorAll('.data-table__skeleton-button');
      expect(skeletonButtons.length).toBeGreaterThan(0);
    });

    it('should render mobile skeleton cards', () => {
      render(<DataTableSkeleton />);
      
      const mobileCards = document.querySelector('.data-table__mobile-cards');
      expect(mobileCards).toBeInTheDocument();
      
      const skeletonCards = document.querySelectorAll('.data-table__card--skeleton');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper table accessibility attributes', () => {
      render(<DataTableSkeleton />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Loading users data');
    });

    it('should have proper semantic structure', () => {
      render(<DataTableSkeleton />);
      
      // Check for table structure
      expect(document.querySelector('thead')).toBeInTheDocument();
      expect(document.querySelector('tbody')).toBeInTheDocument();
      expect(document.querySelector('th[scope="col"]')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render both desktop and mobile skeleton layouts', () => {
      render(<DataTableSkeleton />);
      
      // Desktop layout
      expect(document.querySelector('.data-table__wrapper')).toBeInTheDocument();
      expect(document.querySelector('.data-table__table')).toBeInTheDocument();
      
      // Mobile layout
      expect(document.querySelector('.data-table__mobile-cards')).toBeInTheDocument();
      expect(document.querySelector('.data-table__card--skeleton')).toBeInTheDocument();
    });
  });
});
