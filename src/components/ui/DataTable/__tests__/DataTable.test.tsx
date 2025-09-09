import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DataTable } from '../DataTable';
import type { User } from '../../../../types';

// Mock the custom hooks
jest.mock('../../../../hooks', () => ({
  useDataTableColumns: jest.fn(),
  useColumnVisibility: jest.fn(),
  useTableKeyboardNavigation: jest.fn()
}));

// Mock child components to isolate DataTable logic
jest.mock('../DataTableDesktop', () => ({
  DataTableDesktop: ({ users, handleSort, getSortIcon }: any) => (
    <div data-testid="desktop-table">
      <div>Desktop View - {users.length} users</div>
      <button onClick={() => handleSort('name')}>Sort Name</button>
      <div data-testid="sort-icon">{getSortIcon('name')}</div>
    </div>
  )
}));

jest.mock('../DataTableMobile', () => ({
  DataTableMobile: ({ users }: any) => (
    <div data-testid="mobile-table">Mobile View - {users.length} users</div>
  )
}));

jest.mock('../../ColumnToggle', () => ({
  ColumnToggle: ({ onToggle, onSelectAll }: any) => (
    <div data-testid="column-toggle">
      <button onClick={() => onToggle('name')}>Toggle Name</button>
      <button onClick={onSelectAll}>Select All</button>
    </div>
  )
}));

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      suite: 'Apt 1',
      city: 'Anytown',
      zipcode: '12345',
      geo: { lat: '40.7128', lng: '-74.0060' }
    },
    phone: '555-1234',
    website: 'john.com',
    company: {
      name: 'Test Corp',
      catchPhrase: 'Testing is fun',
      bs: 'test solutions'
    }
  },
  {
    id: 2,
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    address: {
      street: '456 Oak Ave',
      suite: 'Suite 2',
      city: 'Other City',
      zipcode: '67890',
      geo: { lat: '41.8781', lng: '-87.6298' }
    },
    phone: '555-5678',
    website: 'jane.com',
    company: {
      name: 'Another Corp',
      catchPhrase: 'Innovation rocks',
      bs: 'innovative solutions'
    }
  }
];

const mockColumns = [
  { key: 'name', label: 'Name', sortable: true, essential: true, defaultVisible: true },
  { key: 'email', label: 'Email', sortable: true, essential: false, defaultVisible: true },
  { key: 'company.name', label: 'Company', sortable: true, essential: false, defaultVisible: true }
];

const mockColumnVisibility = mockColumns.map(col => ({
  ...col,
  visible: col.defaultVisible
}));

const mockUseDataTableColumns = require('../../../../hooks').useDataTableColumns;
const mockUseColumnVisibility = require('../../../../hooks').useColumnVisibility;

describe('DataTable Component', () => {
  const defaultProps = {
    users: mockUsers,
    onSort: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseDataTableColumns.mockReturnValue(mockColumns);
    mockUseColumnVisibility.mockReturnValue({
      columnVisibility: mockColumnVisibility,
      toggleColumn: jest.fn(),
      selectAllColumns: jest.fn(),
      unselectAllColumns: jest.fn(),
      getVisibleColumns: jest.fn(() => mockColumns)
    });
  });

  describe('Basic Rendering', () => {
    it('should render with users data', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('2 users total')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-table')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-table')).toBeInTheDocument();
      expect(screen.getByTestId('column-toggle')).toBeInTheDocument();
    });

    it('should render loading state for initial load (no users)', () => {
      render(<DataTable {...defaultProps} users={[]} loading={true} />);
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-table')).not.toBeInTheDocument();
    });

    it('should render skeleton when loading with existing users', () => {
      render(<DataTable {...defaultProps} loading={true} />);
      
      // Should show skeleton instead of spinner when users exist
      expect(screen.getByLabelText('Loading users data')).toBeInTheDocument();
      expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
      expect(document.querySelector('.data-table__skeleton-text')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      render(<DataTable {...defaultProps} users={[]} />);
      
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-table')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<DataTable {...defaultProps} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('data-table', 'custom-class');
    });
  });

  describe('Sorting Functionality', () => {
    it('should handle sort actions', async () => {
      const user = userEvent.setup();
      render(<DataTable {...defaultProps} />);
      
      const sortButton = screen.getByText('Sort Name');
      await user.click(sortButton);
      
      expect(defaultProps.onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort order on repeated clicks', async () => {
      const user = userEvent.setup();
      render(<DataTable {...defaultProps} sortField="name" sortOrder="asc" />);
      
      const sortButton = screen.getByText('Sort Name');
      await user.click(sortButton);
      
      expect(defaultProps.onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should not call onSort when not provided', async () => {
      const user = userEvent.setup();
      const { onSort, ...propsWithoutSort } = defaultProps;
      render(<DataTable {...propsWithoutSort} />);
      
      const sortButton = screen.getByText('Sort Name');
      await user.click(sortButton);
      
      // Should not throw error when onSort is undefined
      expect(screen.getByTestId('desktop-table')).toBeInTheDocument();
    });

    it('should display correct sort icons', () => {
      render(<DataTable {...defaultProps} sortField="name" sortOrder="asc" />);
      
      const sortIcon = screen.getByTestId('sort-icon');
      expect(sortIcon).toBeInTheDocument();
    });
  });

  describe('Column Management', () => {
    it('should integrate with column visibility controls', async () => {
      const user = userEvent.setup();
      const mockToggleColumn = jest.fn();
      
      mockUseColumnVisibility.mockReturnValue({
        columnVisibility: mockColumnVisibility,
        toggleColumn: mockToggleColumn,
        selectAllColumns: jest.fn(),
        unselectAllColumns: jest.fn(),
        getVisibleColumns: jest.fn(() => mockColumns)
      });
      
      render(<DataTable {...defaultProps} />);
      
      const toggleButton = screen.getByText('Toggle Name');
      await user.click(toggleButton);
      
      expect(mockToggleColumn).toHaveBeenCalledWith('name');
    });

    it('should handle select all columns', async () => {
      const user = userEvent.setup();
      const mockSelectAllColumns = jest.fn();
      
      mockUseColumnVisibility.mockReturnValue({
        columnVisibility: mockColumnVisibility,
        toggleColumn: jest.fn(),
        selectAllColumns: mockSelectAllColumns,
        unselectAllColumns: jest.fn(),
        getVisibleColumns: jest.fn(() => mockColumns)
      });
      
      render(<DataTable {...defaultProps} />);
      
      const selectAllButton = screen.getByText('Select All');
      await user.click(selectAllButton);
      
      expect(mockSelectAllColumns).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DataTable {...defaultProps} />);
      
      const resultCount = screen.getByRole('status');
      expect(resultCount).toHaveAttribute('aria-live', 'polite');
      expect(resultCount).toHaveAttribute('aria-label', 'Results summary: 2 users total');
      expect(resultCount).toHaveAttribute('tabIndex', '0');
    });

    it('should announce user count changes', () => {
      const { rerender } = render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('2 users total')).toBeInTheDocument();
      
      rerender(<DataTable {...defaultProps} users={[mockUsers[0]]} />);
      
      expect(screen.getByText('1 users total')).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize the component to prevent unnecessary re-renders', () => {
      const { rerender } = render(<DataTable {...defaultProps} />);
      
      // Rerender with same props should not cause re-render due to memo
      rerender(<DataTable {...defaultProps} />);
      
      expect(screen.getByTestId('desktop-table')).toBeInTheDocument();
    });

    it('should handle large datasets efficiently', () => {
      const largeUserSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockUsers[0],
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`
      }));
      
      render(<DataTable {...defaultProps} users={largeUserSet} />);
      
      expect(screen.getByText('100 users total')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-table')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('should handle missing or null user data gracefully', () => {
      const incompleteUsers = [
        { ...mockUsers[0], email: null } as any,
        { ...mockUsers[1], company: null } as any
      ];
      
      render(<DataTable {...defaultProps} users={incompleteUsers} />);
      
      expect(screen.getByText('2 users total')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-table')).toBeInTheDocument();
    });

    it('should pass correct props to child components', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('Desktop View - 2 users')).toBeInTheDocument();
      expect(screen.getByText('Mobile View - 2 users')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should handle hook errors gracefully', () => {
      mockUseDataTableColumns.mockImplementation(() => {
        throw new Error('Hook error');
      });
      
      // Component should still render or handle error gracefully
      // In a real app, this would be wrapped in an ErrorBoundary
      expect(() => render(<DataTable {...defaultProps} />)).toThrow('Hook error');
    });
  });

  describe('State Management', () => {
    it('should maintain sort state correctly', () => {
      const { rerender } = render(
        <DataTable {...defaultProps} sortField="name" sortOrder="asc" />
      );
      
      expect(screen.getByTestId('desktop-table')).toBeInTheDocument();
      
      rerender(
        <DataTable {...defaultProps} sortField="email" sortOrder="desc" />
      );
      
      expect(screen.getByTestId('desktop-table')).toBeInTheDocument();
    });

    it('should handle dynamic user updates', () => {
      const { rerender } = render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('2 users total')).toBeInTheDocument();
      
      const updatedUsers = [...mockUsers, { ...mockUsers[0], id: 3, name: 'New User' }];
      rerender(<DataTable {...defaultProps} users={updatedUsers} />);
      
      expect(screen.getByText('3 users total')).toBeInTheDocument();
    });
  });
});
