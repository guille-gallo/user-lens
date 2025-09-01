import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserDetail } from '../UserDetail';
import type { User } from '../../../../types';

// Mock dependencies
jest.mock('../../Modal', () => ({
  Modal: ({ children, isOpen, onClose, title, footer, size, className }: any) => (
    isOpen ? (
      <div data-testid="modal" className={className}>
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-size">{size}</div>
        <button data-testid="modal-close" onClick={onClose}>Close Modal</button>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null
  )
}));

jest.mock('../../Button/Button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button 
      data-testid={`button-${variant}`}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  )
}));

jest.mock('../../Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>
}));

describe('UserDetail Component', () => {
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    address: {
      street: '123 Main Street',
      suite: 'Apt 4B',
      city: 'New York',
      zipcode: '10001',
      geo: {
        lat: '40.7128',
        lng: '-74.0060'
      }
    },
    phone: '+1-555-123-4567',
    website: 'johndoe.com',
    company: {
      name: 'TechCorp Solutions',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets'
    }
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    user: mockUser
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render null when user is null', () => {
      render(<UserDetail {...defaultProps} user={null} />);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<UserDetail {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true and user exists', () => {
      render(<UserDetail {...defaultProps} />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('User Details - John Doe');
      expect(screen.getByTestId('modal-size')).toHaveTextContent('large');
      expect(screen.getByTestId('modal')).toHaveClass('user-detail-modal');
    });
  });

  describe('Personal Information Section', () => {
    beforeEach(() => {
      render(<UserDetail {...defaultProps} />);
    });

    it('should render personal information section with icon', () => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByTestId('icon-user')).toBeInTheDocument();
    });

    it('should display full name', () => {
      expect(screen.getByText('Full Name:')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display username with @ prefix', () => {
      expect(screen.getByText('Username:')).toBeInTheDocument();
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
    });

    it('should display email as clickable mailto link', () => {
      expect(screen.getByText('Email:')).toBeInTheDocument();
      
      const emailLink = screen.getByRole('link', { name: 'john.doe@example.com' });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
      expect(emailLink).toHaveClass('user-detail__link');
    });

    it('should display phone as clickable tel link', () => {
      expect(screen.getByText('Phone:')).toBeInTheDocument();
      
      const phoneLink = screen.getByRole('link', { name: '+1-555-123-4567' });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:+1-555-123-4567');
      expect(phoneLink).toHaveClass('user-detail__link');
    });

    it('should display website as external link', () => {
      expect(screen.getByText('Website:')).toBeInTheDocument();
      
      const websiteLink = screen.getByRole('link', { name: 'johndoe.com ↗' });
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink).toHaveAttribute('href', 'https://johndoe.com');
      expect(websiteLink).toHaveAttribute('target', '_blank');
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(websiteLink).toHaveClass('user-detail__link');
    });
  });

  describe('Address Information Section', () => {
    beforeEach(() => {
      render(<UserDetail {...defaultProps} />);
    });

    it('should render address section with icon', () => {
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByTestId('icon-location')).toBeInTheDocument();
    });

    it('should display combined street address', () => {
      expect(screen.getByText('Street Address:')).toBeInTheDocument();
      expect(screen.getByText('123 Main Street Apt 4B')).toBeInTheDocument();
    });

    it('should display city', () => {
      expect(screen.getByText('City:')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
    });

    it('should display zip code', () => {
      expect(screen.getByText('Zip Code:')).toBeInTheDocument();
      expect(screen.getByText('10001')).toBeInTheDocument();
    });
  });

  describe('Company Information Section', () => {
    beforeEach(() => {
      render(<UserDetail {...defaultProps} />);
    });

    it('should render company section with icon', () => {
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByTestId('icon-business')).toBeInTheDocument();
    });

    it('should display company name with highlight styling', () => {
      expect(screen.getByText('Company Name:')).toBeInTheDocument();
      
      const companyName = screen.getByText('TechCorp Solutions');
      expect(companyName).toBeInTheDocument();
      expect(companyName).toHaveClass('user-detail__value--highlight');
    });

    it('should display catch phrase with italic styling and quotes', () => {
      expect(screen.getByText('Catch Phrase:')).toBeInTheDocument();
      
      const catchPhrase = screen.getByText('"Multi-layered client-server neural-net"');
      expect(catchPhrase).toBeInTheDocument();
      expect(catchPhrase).toHaveClass('user-detail__value--italic');
    });

    it('should display business description', () => {
      expect(screen.getByText('Business:')).toBeInTheDocument();
      expect(screen.getByText('harness real-time e-markets')).toBeInTheDocument();
    });
  });

  describe('Footer Actions', () => {
    it('should render close button by default', () => {
      render(<UserDetail {...defaultProps} />);
      
      const closeButton = screen.getByTestId('button-outline');
      expect(closeButton).toHaveTextContent('Close');
    });

    it('should render edit button when onEdit is provided', () => {
      const onEdit = jest.fn();
      render(<UserDetail {...defaultProps} onEdit={onEdit} />);
      
      const editButton = screen.getByTestId('button-secondary');
      expect(editButton).toHaveTextContent('Edit User');
    });

    it('should render delete button when onDelete is provided', () => {
      const onDelete = jest.fn();
      render(<UserDetail {...defaultProps} onDelete={onDelete} />);
      
      const deleteButton = screen.getByText('Delete User');
      expect(deleteButton).toHaveClass('button--danger');
    });

    it('should render both edit and delete buttons when both handlers are provided', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      render(<UserDetail {...defaultProps} onEdit={onEdit} onDelete={onDelete} />);
      
      expect(screen.getByTestId('button-secondary')).toHaveTextContent('Edit User');
      expect(screen.getByText('Delete User')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<UserDetail {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByTestId('button-outline');
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      render(<UserDetail {...defaultProps} onEdit={onEdit} />);
      
      const editButton = screen.getByTestId('button-secondary');
      await user.click(editButton);
      
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      render(<UserDetail {...defaultProps} onDelete={onDelete} />);
      
      const deleteButton = screen.getByText('Delete User');
      await user.click(deleteButton);
      
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when modal close is triggered', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<UserDetail {...defaultProps} onClose={onClose} />);
      
      const modalCloseButton = screen.getByTestId('modal-close');
      await user.click(modalCloseButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty address fields gracefully', () => {
      const userWithEmptyAddress: User = {
        ...mockUser,
        address: {
          street: '',
          suite: '',
          city: '',
          zipcode: '',
          geo: { lat: '', lng: '' }
        }
      };
      
      render(<UserDetail {...defaultProps} user={userWithEmptyAddress} />);
      
      expect(screen.getByText('Street Address:')).toBeInTheDocument();
      expect(screen.getByText('City:')).toBeInTheDocument();
      expect(screen.getByText('Zip Code:')).toBeInTheDocument();
    });

    it('should handle empty company fields gracefully', () => {
      const userWithEmptyCompany: User = {
        ...mockUser,
        company: {
          name: '',
          catchPhrase: '',
          bs: ''
        }
      };
      
      render(<UserDetail {...defaultProps} user={userWithEmptyCompany} />);
      
      expect(screen.getByText('Company Name:')).toBeInTheDocument();
      expect(screen.getByText('Catch Phrase:')).toBeInTheDocument();
      expect(screen.getByText('Business:')).toBeInTheDocument();
    });

    it('should handle special characters in user data', () => {
      const userWithSpecialChars: User = {
        ...mockUser,
        name: 'José María Azñar',
        company: {
          ...mockUser.company,
          name: 'Müller & Associates',
          catchPhrase: 'Café "Premium" Solutions'
        }
      };
      
      render(<UserDetail {...defaultProps} user={userWithSpecialChars} />);
      
      expect(screen.getByText('José María Azñar')).toBeInTheDocument();
      expect(screen.getByText('Müller & Associates')).toBeInTheDocument();
      expect(screen.getByText('"Café "Premium" Solutions"')).toBeInTheDocument();
    });

    it('should handle long field values without breaking layout', () => {
      const userWithLongValues: User = {
        ...mockUser,
        name: 'Dr. Alexander Theodore Wellington-Richardson III',
        email: 'alexander.theodore.wellington.richardson.the.third@very-long-company-domain-name.enterprise.com',
        company: {
          name: 'International Advanced Technology Solutions and Engineering Consulting Services Corporation',
          catchPhrase: 'Revolutionizing the global paradigm through innovative synergistic methodologies',
          bs: 'leverage bleeding-edge revolutionary paradigm-shifting next-generation technologies'
        }
      };
      
      render(<UserDetail {...defaultProps} user={userWithLongValues} />);
      
      expect(screen.getByText('Dr. Alexander Theodore Wellington-Richardson III')).toBeInTheDocument();
      expect(screen.getByText('International Advanced Technology Solutions and Engineering Consulting Services Corporation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<UserDetail {...defaultProps} />);
    });

    it('should have proper semantic structure with headings', () => {
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
      expect(headings[0]).toHaveTextContent('Personal Information');
      expect(headings[1]).toHaveTextContent('Address');
      expect(headings[2]).toHaveTextContent('Company');
    });

    it('should have accessible link attributes', () => {
      const emailLink = screen.getByRole('link', { name: 'john.doe@example.com' });
      const phoneLink = screen.getByRole('link', { name: '+1-555-123-4567' });
      const websiteLink = screen.getByRole('link', { name: 'johndoe.com ↗' });
      
      expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
      expect(phoneLink).toHaveAttribute('href', 'tel:+1-555-123-4567');
      expect(websiteLink).toHaveAttribute('href', 'https://johndoe.com');
    });

    it('should have proper ARIA attributes for external links', () => {
      const websiteLink = screen.getByRole('link', { name: 'johndoe.com ↗' });
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(websiteLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to Modal component', () => {
      render(<UserDetail {...defaultProps} />);
      
      expect(screen.getByTestId('modal-title')).toHaveTextContent('User Details - John Doe');
      expect(screen.getByTestId('modal-size')).toHaveTextContent('large');
      expect(screen.getByTestId('modal')).toHaveClass('user-detail-modal');
    });

    it('should render correct icon components', () => {
      render(<UserDetail {...defaultProps} />);
      
      expect(screen.getByTestId('icon-user')).toBeInTheDocument();
      expect(screen.getByTestId('icon-location')).toBeInTheDocument();
      expect(screen.getByTestId('icon-business')).toBeInTheDocument();
    });

    it('should apply correct CSS classes', () => {
      render(<UserDetail {...defaultProps} />);
      
      const content = screen.getByTestId('modal-content');
      expect(content.querySelector('.user-detail')).toBeInTheDocument();
      expect(content.querySelector('.user-detail__section')).toBeInTheDocument();
      expect(content.querySelector('.user-detail__grid')).toBeInTheDocument();
      expect(content.querySelector('.user-detail__field')).toBeInTheDocument();
    });
  });
});
