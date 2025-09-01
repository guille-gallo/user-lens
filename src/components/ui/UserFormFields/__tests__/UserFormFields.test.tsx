import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserFormFields } from '../UserFormFields';
import type { User } from '../../../../types';

// Mock dependencies
jest.mock('../../FormField', () => ({
  FormField: ({ children, label, required, error, htmlFor }: any) => (
    <div data-testid={`form-field-${htmlFor}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span data-testid="required-indicator"> *</span>}
      </label>
      {error && <div data-testid={`error-${htmlFor}`} className="error">{error}</div>}
      {children}
    </div>
  )
}));

jest.mock('../../EditableField', () => ({
  EditableField: ({ label, value, field, isEditing, onEdit, onSave, onCancel }: any) => (
    <div data-testid={`editable-field-${field}`}>
      <span data-testid={`label-${field}`}>{label}</span>
      {isEditing ? (
        <div>
          <input 
            data-testid={`input-${field}`}
            defaultValue={value}
            onBlur={(e) => onSave?.(e.target.value)}
          />
          <button data-testid={`cancel-${field}`} onClick={onCancel}>Cancel</button>
        </div>
      ) : (
        <div>
          <span data-testid={`value-${field}`}>{value}</span>
          <button data-testid={`edit-${field}`} onClick={onEdit}>Edit</button>
        </div>
      )}
    </div>
  )
}));

jest.mock('../../../../constants/ui', () => ({
  PLACEHOLDERS: {
    FULL_NAME: 'Enter full name',
    USERNAME: 'Enter username',
    EMAIL: 'Enter email address',
    PHONE: 'Enter phone number',
    WEBSITE: 'Enter website URL'
  }
}));

jest.mock('../../../../utils/validation', () => ({
  validateField: jest.fn((value, rules) => {
    if (!value && rules.includes('required')) {
      return 'This field is required';
    }
    if (value === 'invalid@email') {
      return 'Invalid email format';
    }
    return null;
  })
}));

jest.mock('../../../../constants/fieldConfig', () => ({
  USER_FIELD_CONFIG: {
    name: ['required'],
    email: ['required', 'email'],
    phone: ['required'],
    'company.name': ['required']
  }
}));

describe('UserFormFields Component', () => {
  const mockUser: Partial<User> = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    website: 'johndoe.com',
    address: {
      street: '123 Main St',
      suite: 'Apt 4B',
      city: 'New York',
      zipcode: '10001',
      geo: { lat: '40.7128', lng: '-74.0060' }
    },
    company: {
      name: 'TechCorp',
      catchPhrase: 'Innovation at its best',
      bs: 'cutting-edge solutions'
    }
  };

  const defaultProps = {
    user: mockUser,
    errors: {},
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Mode (Default)', () => {
    beforeEach(() => {
      render(<UserFormFields {...defaultProps} />);
    });

    it('should render all sections with titles', () => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('should render personal information fields', () => {
      expect(screen.getByTestId('form-field-name')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-username')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-phone')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-website')).toBeInTheDocument();
    });

    it('should render address fields', () => {
      expect(screen.getByTestId('form-field-address.street')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-address.suite')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-address.city')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-address.zipcode')).toBeInTheDocument();
    });

    it('should render company fields', () => {
      expect(screen.getByTestId('form-field-company.name')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-company.catchPhrase')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-company.bs')).toBeInTheDocument();
    });

    it('should show required indicators for required fields', () => {
      expect(screen.getAllByTestId('required-indicator')).toHaveLength(5);
    });

    it('should display current user values in inputs', () => {
      const nameInput = screen.getByDisplayValue('John Doe');
      const emailInput = screen.getByDisplayValue('john.doe@example.com');
      const companyInput = screen.getByDisplayValue('TechCorp');
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(companyInput).toBeInTheDocument();
    });

    it('should display placeholders correctly', () => {
      const nameInput = screen.getByPlaceholderText('Enter full name');
      const emailInput = screen.getByPlaceholderText('Enter email address');
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
    });
  });

  describe('Inline Mode', () => {
    const inlineProps = {
      ...defaultProps,
      mode: 'inline' as const,
      editingField: null,
      onEditField: jest.fn(),
      onSaveField: jest.fn(),
      onCancelEdit: jest.fn()
    };

    it('should render editable fields in inline mode', () => {
      render(<UserFormFields {...inlineProps} />);
      
      expect(screen.getByTestId('editable-field-name')).toBeInTheDocument();
      expect(screen.getByTestId('editable-field-email')).toBeInTheDocument();
      expect(screen.getByTestId('editable-field-company.name')).toBeInTheDocument();
    });

    it('should show edit buttons for non-editing fields', () => {
      render(<UserFormFields {...inlineProps} />);
      
      expect(screen.getByTestId('edit-name')).toBeInTheDocument();
      expect(screen.getByTestId('edit-email')).toBeInTheDocument();
    });

    it('should show input and cancel button for editing field', () => {
      render(
        <UserFormFields 
          {...inlineProps} 
          editingField="name"
        />
      );
      
      expect(screen.getByTestId('input-name')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-name')).toBeInTheDocument();
    });

    it('should call onEditField when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEditField = jest.fn();
      
      render(
        <UserFormFields 
          {...inlineProps} 
          onEditField={onEditField}
        />
      );
      
      await user.click(screen.getByTestId('edit-name'));
      expect(onEditField).toHaveBeenCalledWith('name');
    });
  });

  describe('Field Groups', () => {
    const inlineProps = {
      ...defaultProps,
      mode: 'inline' as const,
      onEditField: jest.fn(),
      onSaveField: jest.fn(),
      onCancelEdit: jest.fn()
    };

    it('should render only personal fields when fieldsGroup is personal', () => {
      render(
        <UserFormFields 
          {...inlineProps} 
          fieldsGroup="personal"
        />
      );
      
      expect(screen.getByTestId('editable-field-name')).toBeInTheDocument();
      expect(screen.getByTestId('editable-field-email')).toBeInTheDocument();
      expect(screen.queryByTestId('editable-field-address.street')).not.toBeInTheDocument();
      expect(screen.queryByTestId('editable-field-company.name')).not.toBeInTheDocument();
    });

    it('should render only address fields when fieldsGroup is address', () => {
      render(
        <UserFormFields 
          {...inlineProps} 
          fieldsGroup="address"
        />
      );
      
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByTestId('editable-field-address.street')).toBeInTheDocument();
      expect(screen.getByTestId('editable-field-address.city')).toBeInTheDocument();
      expect(screen.queryByTestId('editable-field-name')).not.toBeInTheDocument();
    });

    it('should render only company fields when fieldsGroup is company', () => {
      render(
        <UserFormFields 
          {...inlineProps} 
          fieldsGroup="company"
        />
      );
      
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByTestId('editable-field-company.name')).toBeInTheDocument();
      expect(screen.getByTestId('editable-field-company.catchPhrase')).toBeInTheDocument();
      expect(screen.queryByTestId('editable-field-name')).not.toBeInTheDocument();
    });

    it('should hide section titles when showSectionTitles is false', () => {
      render(
        <UserFormFields 
          {...inlineProps} 
          fieldsGroup="address"
          showSectionTitles={false}
        />
      );
      
      expect(screen.queryByText('Address')).not.toBeInTheDocument();
      expect(screen.getByTestId('editable-field-address.street')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when form input values change', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<UserFormFields {...defaultProps} onChange={onChange} />);
      
      const nameInput = screen.getByDisplayValue('John Doe');
      await user.type(nameInput, 'X');
      
      // Should be called with onChange for each character typed
      expect(onChange).toHaveBeenCalledWith('name', 'John DoeX');
    });

    it('should handle nested field changes correctly', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<UserFormFields {...defaultProps} onChange={onChange} />);
      
      const streetInput = screen.getByDisplayValue('123 Main St');
      await user.type(streetInput, 'X');
      
      expect(onChange).toHaveBeenCalledWith('address.street', '123 Main StX');
    });

    it('should disable inputs when disabled prop is true', () => {
      render(<UserFormFields {...defaultProps} disabled={true} />);
      
      const nameInput = screen.getByDisplayValue('John Doe');
      const emailInput = screen.getByDisplayValue('john.doe@example.com');
      
      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display field errors', () => {
      const errors = {
        name: 'Name is required',
        email: 'Invalid email format',
        'company.name': 'Company name is required'
      };
      
      render(<UserFormFields {...defaultProps} errors={errors} />);
      
      expect(screen.getByTestId('error-name')).toHaveTextContent('Name is required');
      expect(screen.getByTestId('error-email')).toHaveTextContent('Invalid email format');
      expect(screen.getByTestId('error-company.name')).toHaveTextContent('Company name is required');
    });

    it('should validate fields during inline editing save', async () => {
      const onSaveField = jest.fn().mockResolvedValue(true);
      
      const user = userEvent.setup();
      
      render(
        <UserFormFields 
          {...defaultProps}
          mode="inline"
          editingField="name"
          onSaveField={onSaveField}
          onEditField={jest.fn()}
          onCancelEdit={jest.fn()}
        />
      );
      
      const input = screen.getByTestId('input-name');
      await user.clear(input);
      await user.type(input, 'Valid Name');
      await user.tab(); // Trigger onBlur
      
      expect(onSaveField).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user object', () => {
      render(<UserFormFields {...defaultProps} user={{}} />);
      
      const nameInput = screen.getByLabelText(/Full Name/);
      const emailInput = screen.getByLabelText(/Email/);
      
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
    });

    it('should handle missing nested objects', () => {
      const userMissingNested: Partial<User> = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing address and company objects
      };

      render(<UserFormFields {...defaultProps} user={userMissingNested} />);
      
      const streetInput = screen.getByLabelText('Street');
      const companyInput = screen.getByLabelText(/Company Name/);
      
      expect(streetInput).toHaveValue('');
      expect(companyInput).toHaveValue('');
    });    it('should handle very long field values', () => {
      const userWithLongValues = {
        ...mockUser,
        name: 'A'.repeat(1000),
        company: {
          name: 'B'.repeat(500),
          catchPhrase: 'C'.repeat(500),
          bs: 'D'.repeat(500)
        }
      };
      
      render(<UserFormFields {...defaultProps} user={userWithLongValues} />);
      
      expect(screen.getByDisplayValue('A'.repeat(1000))).toBeInTheDocument();
      expect(screen.getByDisplayValue('B'.repeat(500))).toBeInTheDocument();
    });

    it('should handle special characters in field values', () => {
      const userWithSpecialChars = {
        ...mockUser,
        name: 'José María Azñar',
        company: {
          name: 'Müller & Associates',
          catchPhrase: 'Café "Premium" Solutions',
          bs: 'résumé & naïve solutions'
        }
      };
      
      render(<UserFormFields {...defaultProps} user={userWithSpecialChars} />);
      
      expect(screen.getByDisplayValue('José María Azñar')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Müller & Associates')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Café "Premium" Solutions')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<UserFormFields {...defaultProps} />);
    });

    it('should have proper semantic structure with headings', () => {
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
      expect(headings[0]).toHaveTextContent('Personal Information');
      expect(headings[1]).toHaveTextContent('Address');
      expect(headings[2]).toHaveTextContent('Company');
    });

    it('should associate labels with inputs correctly', () => {
      const nameInput = screen.getByLabelText('Full Name *');
      const emailInput = screen.getByLabelText('Email *');
      
      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('should indicate required fields visually', () => {
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getAllByTestId('required-indicator')).toHaveLength(5); // 5 required fields
    });

    it('should have logical tab order', async () => {
      const user = userEvent.setup();
      
      // First field should be name
      await user.tab();
      expect(screen.getByDisplayValue('John Doe')).toHaveFocus();
      
      // Next should be username
      await user.tab();
      expect(screen.getByDisplayValue('johndoe')).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props are the same', () => {
      const { rerender } = render(<UserFormFields {...defaultProps} />);
      
      const nameInput = screen.getByDisplayValue('John Doe');
      const initialInput = nameInput;
      
      // Re-render with same props
      rerender(<UserFormFields {...defaultProps} />);
      
      const newNameInput = screen.getByDisplayValue('John Doe');
      expect(newNameInput).toBe(initialInput);
    });

    it('should handle large datasets efficiently', () => {
      const performanceStart = performance.now();
      
      render(<UserFormFields {...defaultProps} />);
      
      const performanceEnd = performance.now();
      const renderTime = performanceEnd - performanceStart;
      
      // Should render quickly (under 100ms in most cases)
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('Integration with Dependencies', () => {
    it('should integrate with FormField component correctly', () => {
      render(<UserFormFields {...defaultProps} />);
      
      // FormField should receive correct props
      expect(screen.getByTestId('form-field-name')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
    });

    it('should integrate with EditableField component correctly', () => {
      render(
        <UserFormFields 
          {...defaultProps}
          mode="inline"
          onEditField={jest.fn()}
          onSaveField={jest.fn()}
          onCancelEdit={jest.fn()}
        />
      );
      
      // EditableField should receive correct props
      expect(screen.getByTestId('editable-field-name')).toBeInTheDocument();
      expect(screen.getByTestId('value-name')).toHaveTextContent('John Doe');
    });

    it('should integrate with UI constants correctly', () => {
      render(<UserFormFields {...defaultProps} />);
      
      // Verify that required field constants are used properly
      const nameField = screen.getByTestId('form-field-name');
      const emailField = screen.getByTestId('form-field-email');
      
      expect(nameField).toBeInTheDocument();
      expect(emailField).toBeInTheDocument();
      
      // Check that required indicators are shown for required fields
      const requiredIndicators = screen.getAllByTestId('required-indicator');
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });
  });
});
