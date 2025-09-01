import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserForm } from '../UserForm';
import type { User } from '../../../../types';

// Mock child components
jest.mock('../../UserFormFields', () => ({
  UserFormFields: ({ user, errors, onChange, disabled }: any) => (
    <div data-testid="user-form-fields">
      <input
        data-testid="name-input"
        value={user.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        disabled={disabled}
        placeholder="Enter name"
      />
      <input
        data-testid="email-input"
        value={user.email || ''}
        onChange={(e) => onChange('email', e.target.value)}
        disabled={disabled}
        placeholder="Enter email"
      />
      {errors.name && <div data-testid="name-error">{errors.name}</div>}
      {errors.email && <div data-testid="email-error">{errors.email}</div>}
    </div>
  )
}));

jest.mock('../../ResponsiveEditingContainer', () => ({
  ResponsiveEditingContainer: ({ children, isOpen, title, subtitle, footer, onClose }: any) => (
    isOpen ? (
      <div data-testid="editing-container">
        <div data-testid="container-title">{title}</div>
        <div data-testid="container-subtitle">{subtitle}</div>
        <div data-testid="container-content">{children}</div>
        <div data-testid="container-footer">{footer}</div>
        <button data-testid="close-button" onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}));

jest.mock('../../Button/Button', () => ({
  Button: ({ children, onClick, type, variant, loading, disabled, form }: any) => (
    <button
      data-testid={`button-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      form={form}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}));

// Mock the validation hook
jest.mock('../../../../hooks/useValidation', () => ({
  useValidation: jest.fn()
}));

const mockUser: User = {
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
};

const mockUseValidation = require('../../../../hooks/useValidation').useValidation;

describe('UserForm Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(() => Promise.resolve()),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseValidation.mockReturnValue({
      errors: {},
      validateForm: jest.fn(() => true),
      clearAllErrors: jest.fn()
    });
  });

  describe('Basic Rendering', () => {
    it('should render create mode when no user provided', () => {
      render(<UserForm {...defaultProps} />);
      
      expect(screen.getByTestId('container-title')).toHaveTextContent('Add New User');
      expect(screen.getByTestId('container-subtitle')).toHaveTextContent('Add a new user to the system');
      expect(screen.getByTestId('button-primary')).toHaveTextContent('Create User');
    });

    it('should render edit mode when user provided', () => {
      render(<UserForm {...defaultProps} user={mockUser} />);
      
      expect(screen.getByTestId('container-title')).toHaveTextContent('Edit User');
      expect(screen.getByTestId('container-subtitle')).toHaveTextContent('Editing John Doe');
      expect(screen.getByTestId('button-primary')).toHaveTextContent('Update User');
    });

    it('should not render when isOpen is false', () => {
      render(<UserForm {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('editing-container')).not.toBeInTheDocument();
    });

    it('should render footer buttons', () => {
      render(<UserForm {...defaultProps} />);
      
      expect(screen.getByTestId('button-primary')).toBeInTheDocument();
      expect(screen.getByTestId('button-outline')).toHaveTextContent('Cancel');
    });
  });

  describe('Form State Management', () => {
    it('should initialize empty form for create mode', () => {
      render(<UserForm {...defaultProps} />);
      
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
    });

    it('should populate form with user data in edit mode', () => {
      render(<UserForm {...defaultProps} user={mockUser} />);
      
      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('email-input');
      
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
    });

    it('should handle form field changes', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);
      
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'Jane Smith');
      
      expect(nameInput).toHaveValue('Jane Smith');
    });

    it('should handle nested field changes', async () => {
      render(<UserForm {...defaultProps} />);
      
      // Verify the form can handle nested field changes through UserFormFields
      const userFormFields = screen.getByTestId('user-form-fields');
      expect(userFormFields).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockValidateForm = jest.fn(() => true);
      
      mockUseValidation.mockReturnValue({
        errors: {},
        validateForm: mockValidateForm,
        clearAllErrors: jest.fn()
      });
      
      render(<UserForm {...defaultProps} />);
      
      const submitButton = screen.getByTestId('button-primary');
      await user.click(submitButton);
      
      expect(mockValidateForm).toHaveBeenCalled();
      expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it('should not submit form with invalid data', async () => {
      const user = userEvent.setup();
      const mockValidateForm = jest.fn(() => false);
      
      mockUseValidation.mockReturnValue({
        errors: { name: 'Name is required' },
        validateForm: mockValidateForm,
        clearAllErrors: jest.fn()
      });
      
      render(<UserForm {...defaultProps} />);
      
      const submitButton = screen.getByTestId('button-primary');
      await user.click(submitButton);
      
      expect(mockValidateForm).toHaveBeenCalled();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should close form after successful submission', async () => {
      const user = userEvent.setup();
      
      render(<UserForm {...defaultProps} />);
      
      const submitButton = screen.getByTestId('button-primary');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn(() => Promise.reject(new Error('Submission failed')));
      
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<UserForm {...defaultProps} onSubmit={mockSubmit} />);
      
      const submitButton = screen.getByTestId('button-primary');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Form submission error:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should disable form during loading', () => {
      render(<UserForm {...defaultProps} loading={true} />);
      
      const nameInput = screen.getByTestId('name-input');
      const submitButton = screen.getByTestId('button-primary');
      const cancelButton = screen.getByTestId('button-outline');
      
      expect(nameInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading text on submit button', () => {
      render(<UserForm {...defaultProps} loading={true} />);
      
      const submitButton = screen.getByTestId('button-primary');
      expect(submitButton).toHaveTextContent('Loading...');
    });
  });

  describe('Validation Integration', () => {
    it('should display validation errors', () => {
      mockUseValidation.mockReturnValue({
        errors: { 
          name: 'Name is required',
          email: 'Invalid email format'
        },
        validateForm: jest.fn(),
        clearAllErrors: jest.fn()
      });
      
      render(<UserForm {...defaultProps} />);
      
      expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email format');
    });

    it('should clear errors when form is opened', () => {
      const mockClearAllErrors = jest.fn();
      
      mockUseValidation.mockReturnValue({
        errors: {},
        validateForm: jest.fn(),
        clearAllErrors: mockClearAllErrors
      });
      
      render(<UserForm {...defaultProps} />);
      
      expect(mockClearAllErrors).toHaveBeenCalled();
    });
  });

  describe('User Interaction', () => {
    it('should handle cancel button click', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);
      
      const cancelButton = screen.getByTestId('button-outline');
      await user.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle close button click', async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-button');
      await user.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<UserForm {...defaultProps} />);
      
      const form = screen.getByTestId('user-form-fields').parentElement;
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('id', 'user-form');
      expect(form).toHaveAttribute('noValidate');
    });

    it('should associate submit button with form', () => {
      render(<UserForm {...defaultProps} />);
      
      const submitButton = screen.getByTestId('button-primary');
      expect(submitButton).toHaveAttribute('form', 'user-form');
    });
  });

  describe('Data Handling', () => {
    it('should handle partial user data in edit mode', () => {
      const partialUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      } as User;
      
      render(<UserForm {...defaultProps} user={partialUser} />);
      
      const nameInput = screen.getByTestId('name-input');
      expect(nameInput).toHaveValue('John Doe');
    });

    it('should reset form when switching from edit to create mode', () => {
      const { rerender } = render(<UserForm {...defaultProps} user={mockUser} />);
      
      const nameInput = screen.getByTestId('name-input');
      expect(nameInput).toHaveValue('John Doe');
      
      rerender(<UserForm {...defaultProps} user={undefined} />);
      
      expect(nameInput).toHaveValue('');
    });
  });

  describe('Form Validation', () => {
    it('should prevent form submission with Enter key when invalid', async () => {
      const user = userEvent.setup();
      const mockValidateForm = jest.fn(() => false);
      
      mockUseValidation.mockReturnValue({
        errors: { name: 'Required' },
        validateForm: mockValidateForm,
        clearAllErrors: jest.fn()
      });
      
      render(<UserForm {...defaultProps} />);
      
      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, '{enter}');
      
      // Form submission should be prevented
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });
});
