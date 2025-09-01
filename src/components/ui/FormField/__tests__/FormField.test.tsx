import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormField } from '../FormField';

describe('FormField Component', () => {
  const defaultProps = {
    label: 'Test Label',
    children: <input data-testid="test-input" />
  };

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<FormField {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
      
      const container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).toHaveClass('form-field');
      expect(container).not.toHaveClass('form-field--error');
    });

    it('should render label correctly', () => {
      render(<FormField {...defaultProps} label="Custom Label" />);
      
      const label = screen.getByText('Custom Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('form-field__label');
    });

    it('should render children correctly', () => {
      render(
        <FormField {...defaultProps}>
          <input data-testid="custom-input" placeholder="Test input" />
        </FormField>
      );
      
      expect(screen.getByTestId('custom-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<FormField {...defaultProps} className="custom-class" />);
      
      const container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Required Field', () => {
    it('should show required indicator when required is true', () => {
      render(<FormField {...defaultProps} required={true} />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
      const indicator = screen.getByText('*');
      expect(indicator).toHaveClass('form-field__required');
      expect(indicator).toHaveAttribute('aria-label', 'required');
    });

    it('should not show required indicator when required is false', () => {
      render(<FormField {...defaultProps} required={false} />);
      
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should not show required indicator by default', () => {
      render(<FormField {...defaultProps} />);
      
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      const errorMessage = 'This field is required';
      render(<FormField {...defaultProps} error={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should apply error styling when error exists', () => {
      render(<FormField {...defaultProps} error="Some error" />);
      
      const container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).toHaveClass('form-field--error');
    });

    it('should not display error message when error is empty', () => {
      render(<FormField {...defaultProps} error="" />);
      
      const errorSpan = document.querySelector('.form-field__error');
      expect(errorSpan).not.toBeInTheDocument();
    });

    it('should not apply error styling when no error', () => {
      render(<FormField {...defaultProps} />);
      
      const container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).not.toHaveClass('form-field--error');
    });

    it('should handle multiline error messages', () => {
      const multilineError = 'Line 1\nLine 2\nLine 3';
      render(<FormField {...defaultProps} error={multilineError} />);
      
      const errorSpan = document.querySelector('.form-field__error');
      // Check that the error contains the text, accounting for browser normalization
      expect(errorSpan).toHaveTextContent('Line 1 Line 2 Line 3');
    });
  });

  describe('Label Association', () => {
    it('should associate label with input using htmlFor', () => {
      render(
        <FormField {...defaultProps} htmlFor="test-input-id">
          <input data-testid="test-input" id="test-input-id" />
        </FormField>
      );
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input-id');
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('id', 'test-input-id');
    });

    it('should not have htmlFor when not provided', () => {
      render(<FormField {...defaultProps} />);
      
      const label = screen.getByText('Test Label');
      expect(label).not.toHaveAttribute('htmlFor');
    });
  });

  describe('Children Variants', () => {
    it('should render with input element', () => {
      render(
        <FormField {...defaultProps}>
          <input type="text" data-testid="text-input" />
        </FormField>
      );
      
      expect(screen.getByTestId('text-input')).toBeInTheDocument();
    });

    it('should render with textarea element', () => {
      render(
        <FormField {...defaultProps}>
          <textarea data-testid="textarea-input" />
        </FormField>
      );
      
      expect(screen.getByTestId('textarea-input')).toBeInTheDocument();
    });

    it('should render with select element', () => {
      render(
        <FormField {...defaultProps}>
          <select data-testid="select-input">
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
          </select>
        </FormField>
      );
      
      expect(screen.getByTestId('select-input')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should render with multiple children', () => {
      render(
        <FormField {...defaultProps}>
          <input data-testid="input-1" />
          <input data-testid="input-2" />
        </FormField>
      );
      
      expect(screen.getByTestId('input-1')).toBeInTheDocument();
      expect(screen.getByTestId('input-2')).toBeInTheDocument();
    });

    it('should render with custom components', () => {
      const CustomComponent = () => <div data-testid="custom-component">Custom</div>;
      
      render(
        <FormField {...defaultProps}>
          <CustomComponent />
        </FormField>
      );
      
      expect(screen.getByTestId('custom-component')).toBeInTheDocument();
    });
  });

  describe('Complete Field States', () => {
    it('should render complete field with all props', () => {
      render(
        <FormField 
          label="Full Example"
          htmlFor="full-input"
          required={true}
          error="Validation error"
          className="custom-field"
        >
          <input id="full-input" data-testid="full-input" />
        </FormField>
      );
      
      expect(screen.getByText('Full Example')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Validation error')).toBeInTheDocument();
      
      const container = screen.getByTestId('full-input').closest('.form-field');
      expect(container).toHaveClass('form-field--error', 'custom-field');
      
      const label = screen.getByText('Full Example');
      expect(label).toHaveAttribute('for', 'full-input');
    });

    it('should handle state transitions', () => {
      const { rerender } = render(<FormField {...defaultProps} />);
      
      let container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).not.toHaveClass('form-field--error');
      
      rerender(<FormField {...defaultProps} error="Now has error" />);
      container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).toHaveClass('form-field--error');
      
      rerender(<FormField {...defaultProps} error="" />);
      container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).not.toHaveClass('form-field--error');
    });
  });

  describe('Accessibility', () => {
    it('should provide proper semantic structure', () => {
      render(
        <FormField {...defaultProps} htmlFor="accessible-input" required={true}>
          <input id="accessible-input" data-testid="accessible-input" />
        </FormField>
      );
      
      const label = screen.getByText('Test Label');
      const input = screen.getByTestId('accessible-input');
      
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', 'accessible-input');
      expect(input).toHaveAttribute('id', 'accessible-input');
    });

    it('should associate error with input for screen readers', () => {
      render(<FormField {...defaultProps} error="Test error" />);
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should indicate required fields to screen readers', () => {
      render(<FormField {...defaultProps} required={true} />);
      
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toHaveAttribute('aria-label', 'required');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      render(<FormField {...defaultProps} label="" />);
      
      const label = document.querySelector('.form-field__label');
      expect(label).toHaveTextContent('');
    });

    it('should handle special characters in label', () => {
      const specialLabel = 'Label with "quotes" & symbols!';
      render(<FormField {...defaultProps} label={specialLabel} />);
      
      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longError = 'This is a very long error message '.repeat(10);
      render(<FormField {...defaultProps} error={longError} />);
      
      // Use textContent to get the exact text including whitespace normalization
      const errorSpan = document.querySelector('.form-field__error');
      expect(errorSpan).toHaveTextContent(longError.trim());
    });

    it('should handle undefined className gracefully', () => {
      render(<FormField {...defaultProps} className={undefined} />);
      
      const container = screen.getByTestId('test-input').closest('.form-field');
      expect(container).toHaveClass('form-field');
    });
  });

  describe('Component Integration', () => {
    it('should work within a form', () => {
      render(
        <form data-testid="test-form">
          <FormField {...defaultProps} htmlFor="form-input">
            <input id="form-input" name="testField" />
          </FormField>
        </form>
      );
      
      const form = screen.getByTestId('test-form');
      const input = screen.getByDisplayValue('');
      
      expect(form).toContainElement(input);
    });

    it('should support field validation patterns', () => {
      render(
        <FormField {...defaultProps} error="Invalid format">
          <input 
            pattern="[A-Za-z]+" 
            title="Only letters allowed"
            data-testid="pattern-input"
          />
        </FormField>
      );
      
      const input = screen.getByTestId('pattern-input');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
      expect(screen.getByText('Invalid format')).toBeInTheDocument();
    });
  });
});
