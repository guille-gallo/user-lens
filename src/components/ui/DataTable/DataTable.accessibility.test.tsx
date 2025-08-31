import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DataTable } from './DataTable';
import type { User } from '../../../services/userService';

// Mock data for testing
const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '123-456-7890',
    website: 'johndoe.com',
    address: {
      street: '123 Main St',
      suite: 'Apt 1',
      city: 'Anytown',
      zipcode: '12345',
      geo: { lat: '0', lng: '0' }
    },
    company: {
      name: 'ACME Corp',
      catchPhrase: 'We make things',
      bs: 'business solutions'
    }
  },
  {
    id: 2,
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    website: 'janesmith.com',
    address: {
      street: '456 Oak Ave',
      suite: 'Suite 2',
      city: 'Somewhere',
      zipcode: '67890',
      geo: { lat: '1', lng: '1' }
    },
    company: {
      name: 'Tech Inc',
      catchPhrase: 'Innovation first',
      bs: 'technology solutions'
    }
  }
];

describe('DataTable Accessibility', () => {
  const defaultProps = {
    users: mockUsers,
    onSort: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
    sortField: null,
    sortOrder: 'asc' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Semantic Structure', () => {
    test('renders table with proper ARIA roles', () => {
      render(<DataTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute('aria-label', 'Users data table');
    });

    test('has accessible table caption', () => {
      render(<DataTable {...defaultProps} />);
      
      const caption = screen.getByText(/User information table with 2 users/);
      expect(caption).toBeInTheDocument();
      expect(caption).toHaveTextContent('Use arrow keys to navigate table cells');
    });

    test('column headers have proper roles and sort attributes', () => {
      render(<DataTable {...defaultProps} sortField="name" sortOrder="asc" />);
      
      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  describe('Keyboard Navigation', () => {
    test('table cells are focusable', () => {
      render(<DataTable {...defaultProps} />);
      
      const firstCell = screen.getByText('John Doe').closest('td');
      expect(firstCell).toHaveAttribute('tabindex', '0');
    });

    test('arrow keys navigate between cells', async () => {
      const user = userEvent.setup();
      render(<DataTable {...defaultProps} />);
      
      const firstCell = screen.getByText('John Doe').closest('td');
      if (firstCell) {
        await user.click(firstCell);
        
        // Test right arrow navigation
        await user.keyboard('{ArrowRight}');
        
        const secondCell = screen.getByText('johndoe').closest('td');
        expect(secondCell).toHaveFocus();
      }
    });

    test('down arrow navigates to next row', async () => {
      const user = userEvent.setup();
      render(<DataTable {...defaultProps} />);
      
      const firstRowFirstCell = screen.getByText('John Doe').closest('td');
      if (firstRowFirstCell) {
        await user.click(firstRowFirstCell);
        
        // Test down arrow navigation
        await user.keyboard('{ArrowDown}');
        
        const secondRowFirstCell = screen.getByText('Jane Smith').closest('td');
        expect(secondRowFirstCell).toHaveFocus();
      }
    });

    test('navigation stays within table bounds', async () => {
      const user = userEvent.setup();
      render(<DataTable {...defaultProps} />);
      
      const firstCell = screen.getByText('John Doe').closest('td');
      if (firstCell) {
        await user.click(firstCell);
        
        // Try to navigate up from first row (should stay in place)
        await user.keyboard('{ArrowUp}');
        expect(firstCell).toHaveFocus();
        
        // Try to navigate left from first column (should stay in place)
        await user.keyboard('{ArrowLeft}');
        expect(firstCell).toHaveFocus();
      }
    });
  });

  describe('Screen Reader Support', () => {
    test('has live region for announcements', () => {
      render(<DataTable {...defaultProps} />);
      
      const announceRegion = document.querySelector('[aria-live="polite"]');
      expect(announceRegion).toBeInTheDocument();
      expect(announceRegion).toHaveAttribute('aria-atomic', 'true');
    });

    test('action buttons have descriptive labels', () => {
      render(<DataTable {...defaultProps} />);
      
      const viewButton = screen.getByLabelText('View details for John Doe');
      const editButton = screen.getByLabelText('Edit John Doe');
      const deleteButton = screen.getByLabelText('Delete John Doe');
      
      expect(viewButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    test('cells have position attributes', () => {
      render(<DataTable {...defaultProps} />);
      
      const firstCell = screen.getByText('John Doe').closest('td');
      expect(firstCell).toHaveAttribute('data-cell-position', '0-0');
    });
  });

  describe('Focus Management', () => {
    test('only one cell is tabbable at a time', () => {
      render(<DataTable {...defaultProps} />);
      
      const cells = screen.getAllByRole('cell');
      const tabbableCells = cells.filter(cell => cell.getAttribute('tabindex') === '0');
      
      expect(tabbableCells).toHaveLength(1);
    });

    test('focus moves correctly with keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DataTable {...defaultProps} />);
      
      const firstCell = screen.getByText('John Doe').closest('td');
      if (firstCell) {
        await user.click(firstCell);
        
        // Navigate right
        await user.keyboard('{ArrowRight}');
        
        // Check that tabindex moved
        expect(firstCell).toHaveAttribute('tabindex', '-1');
        
        const secondCell = screen.getByText('johndoe').closest('td');
        expect(secondCell).toHaveAttribute('tabindex', '0');
      }
    });
  });

  describe('Interactive Elements', () => {
    test('links within cells remain accessible', () => {
      render(<DataTable {...defaultProps} />);
      
      const emailLink = screen.getByRole('link', { name: 'john@example.com' });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
    });

    test('action buttons remain focusable and functional', async () => {
      const user = userEvent.setup();
      render(<DataTable {...defaultProps} />);
      
      const viewButton = screen.getByLabelText('View details for John Doe');
      await user.click(viewButton);
      
      expect(defaultProps.onView).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  describe('Responsive Behavior', () => {
    test('mobile cards maintain accessibility', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      
      render(<DataTable {...defaultProps} />);
      
      const cardActions = screen.getAllByRole('button', { name: /view details/i });
      expect(cardActions).toHaveLength(2); // One for each user in mobile view
    });
  });
});

export { };
