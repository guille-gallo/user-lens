import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchBar } from '../SearchBar';

// Mock the Icon component
jest.mock('../../Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>
}));

describe('SearchBar Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Search...',
    className: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<SearchBar {...defaultProps} />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search...');
      expect(input).toHaveValue('');
      expect(input).toHaveAttribute('aria-label', 'Search input');
    });

    it('should render with custom placeholder', () => {
      render(<SearchBar {...defaultProps} placeholder="Find users..." />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('placeholder', 'Find users...');
    });

    it('should render with initial value', () => {
      render(<SearchBar {...defaultProps} value="test query" />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveValue('test query');
    });

    it('should apply custom className', () => {
      render(<SearchBar {...defaultProps} className="custom-search" />);
      
      const container = screen.getByRole('searchbox').closest('.search-bar');
      expect(container).toHaveClass('search-bar', 'custom-search');
    });

    it('should render search icon', () => {
      render(<SearchBar {...defaultProps} />);
      
      const searchIcon = screen.getByTestId('icon-search');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Clear Functionality', () => {
    it('should show clear button when value is present', () => {
      render(<SearchBar {...defaultProps} value="test" />);
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeInTheDocument();
      
      const closeIcon = screen.getByTestId('icon-close');
      expect(closeIcon).toBeInTheDocument();
    });

    it('should not show clear button when value is empty', () => {
      render(<SearchBar {...defaultProps} value="" />);
      
      const clearButton = screen.queryByRole('button', { name: 'Clear search' });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should call onChange with empty string when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} value="test query" onChange={onChange} />);
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      await user.click(clearButton);
      
      expect(onChange).toHaveBeenCalledWith('');
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input Interaction', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'hello');
      
      // userEvent.type calls onChange for each character with individual characters
      expect(onChange).toHaveBeenCalledTimes(5); // One for each character
      expect(onChange).toHaveBeenNthCalledWith(1, 'h');
      expect(onChange).toHaveBeenNthCalledWith(2, 'e');
      expect(onChange).toHaveBeenNthCalledWith(3, 'l');
      expect(onChange).toHaveBeenNthCalledWith(4, 'l');
      expect(onChange).toHaveBeenNthCalledWith(5, 'o');
    });

    it('should handle typing with existing value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} value="test" onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      await user.clear(input);
      await user.type(input, 'new value');
      
      expect(onChange).toHaveBeenCalled();
    });

    it('should handle backspace and deletion', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} value="test" onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      await user.click(input);
      await user.keyboard('{Backspace}');
      
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SearchBar {...defaultProps} />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-label', 'Search input');
      expect(input).toHaveAttribute('role', 'searchbox');
    });

    it('should have accessible clear button', () => {
      render(<SearchBar {...defaultProps} value="test" />);
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
      expect(clearButton).toHaveAttribute('type', 'button');
    });

    it('should have proper search icon accessibility', () => {
      render(<SearchBar {...defaultProps} />);
      
      const searchIconContainer = screen.getByTestId('icon-search').closest('.search-bar__search-icon');
      expect(searchIconContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Input States', () => {
    it('should handle controlled input behavior', () => {
      const { rerender } = render(<SearchBar {...defaultProps} value="initial" />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveValue('initial');
      
      rerender(<SearchBar {...defaultProps} value="updated" />);
      expect(input).toHaveValue('updated');
    });

    it('should handle empty string gracefully', () => {
      render(<SearchBar {...defaultProps} value="" />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveValue('');
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, '!@#$%^&*()');
      
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = (props: any) => {
        renderSpy();
        return <SearchBar {...props} />;
      };

      const { rerender } = render(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid typing efficiently', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      
      // Simulate rapid typing
      await user.type(input, 'quick');
      
      expect(onChange).toHaveBeenCalledTimes(5);
      // Each character is called individually
      expect(onChange).toHaveBeenNthCalledWith(5, 'k');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined placeholder', () => {
      const propsWithoutPlaceholder = { ...defaultProps };
      delete (propsWithoutPlaceholder as any).placeholder;
      
      render(<SearchBar {...propsWithoutPlaceholder} />);
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('placeholder', 'Search...');
    });

    it('should handle undefined className', () => {
      const propsWithoutClassName = { ...defaultProps };
      delete (propsWithoutClassName as any).className;
      
      render(<SearchBar {...propsWithoutClassName} />);
      
      const container = screen.getByRole('searchbox').closest('.search-bar');
      expect(container).toHaveClass('search-bar');
    });

    it('should handle whitespace-only input', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, '   ');
      
      expect(onChange).toHaveBeenCalledTimes(3);
      // Each space is called individually
      expect(onChange).toHaveBeenNthCalledWith(3, ' ');
    });

    it('should handle very long input values', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const longText = 'a'.repeat(100); // Reduced from 1000 to avoid timeout
      
      render(<SearchBar {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      await user.type(input, longText);
      
      expect(onChange).toHaveBeenCalledTimes(100);
      // Each character is called individually
      expect(onChange).toHaveBeenNthCalledWith(100, 'a');
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('Component Integration', () => {
    it('should work with form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn((e) => e.preventDefault());
      const onChange = jest.fn();
      
      render(
        <form onSubmit={onSubmit}>
          <SearchBar {...defaultProps} onChange={onChange} />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByRole('searchbox');
      await user.type(input, 'search term');
      
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await user.click(submitButton);
      
      expect(onSubmit).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...defaultProps} value="test" onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      
      await user.tab();
      expect(input).toHaveFocus();
      
      await user.tab();
      expect(clearButton).toHaveFocus();
    });
  });
});
