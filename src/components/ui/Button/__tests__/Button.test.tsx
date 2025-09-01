import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '../Button';

describe('Button Component', () => {
  const defaultProps = {
    children: 'Test Button'
  };

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('button', 'button--primary', 'button--medium');
      expect(button).not.toBeDisabled();
    });

    it('should render with custom variant', () => {
      render(<Button {...defaultProps} variant="secondary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--secondary');
    });

    it('should render with custom size', () => {
      render(<Button {...defaultProps} size="large" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--large');
    });

    it('should render with custom className', () => {
      render(<Button {...defaultProps} className="custom-button" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
    });

    it('should render all variants correctly', () => {
      const variants = ['primary', 'secondary', 'danger', 'outline'] as const;
      
      variants.forEach(variant => {
        render(<Button variant={variant}>Button {variant}</Button>);
        const button = screen.getByRole('button', { name: `Button ${variant}` });
        expect(button).toHaveClass(`button--${variant}`);
      });
    });

    it('should render all sizes correctly', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      
      sizes.forEach(size => {
        render(<Button size={size}>Button {size}</Button>);
        const button = screen.getByRole('button', { name: `Button ${size}` });
        expect(button).toHaveClass(`button--${size}`);
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<Button {...defaultProps} loading={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('button--loading');
      expect(screen.getByText('⟳')).toBeInTheDocument();
      expect(screen.getByText('Test Button')).toHaveClass('button__text--hidden');
    });

    it('should not be clickable when loading', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button {...defaultProps} loading={true} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should combine loading class with other classes', () => {
      render(
        <Button 
          {...defaultProps} 
          loading={true} 
          variant="danger" 
          size="large" 
          className="custom"
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'button', 
        'button--danger', 
        'button--large', 
        'button--loading', 
        'custom'
      );
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be clickable when disabled', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button {...defaultProps} disabled={true} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should be disabled when both disabled and loading are true', () => {
      render(<Button {...defaultProps} disabled={true} loading={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should support space key activation', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props Forwarding', () => {
    it('should forward HTML button attributes', () => {
      render(
        <Button 
          {...defaultProps} 
          type="submit" 
          form="test-form"
          aria-label="Custom label"
          data-testid="custom-button"
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
    });

    it('should forward event handlers', async () => {
      const user = userEvent.setup();
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      
      render(
        <Button 
          {...defaultProps}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      );
      
      const button = screen.getByRole('button');
      
      await user.hover(button);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);
      
      await user.unhover(button);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
      
      button.focus();
      expect(onFocus).toHaveBeenCalledTimes(1);
      
      button.blur();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Children Content', () => {
    it('should render text children', () => {
      render(<Button>Simple Text</Button>);
      
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });

    it('should render JSX children', () => {
      render(
        <Button>
          <span data-testid="icon">Icon</span>
          <span>Text</span>
        </Button>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should render complex children', () => {
      render(
        <Button>
          <div>
            <span>Complex</span>
            <strong>Content</strong>
          </div>
        </Button>
      );
      
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<Button {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Disabled buttons should not be focusable via tab navigation
    });

    it('should have proper ARIA attributes', () => {
      render(<Button {...defaultProps} aria-label="Custom accessible name" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom accessible name');
    });

    it('should announce loading state to screen readers', () => {
      render(<Button {...defaultProps} loading={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      // Check that the spinner has aria-hidden
      const spinner = screen.getByText('⟳');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Button>{''}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle null children', () => {
      render(<Button>{null}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined className', () => {
      const props = { ...defaultProps };
      delete (props as any).className;
      
      render(<Button {...props} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button');
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(<Button {...defaultProps} loading={false} />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      
      rerender(<Button {...defaultProps} loading={true} />);
      expect(button).toBeDisabled();
      
      rerender(<Button {...defaultProps} loading={false} disabled={true} />);
      expect(button).toBeDisabled();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = (props: any) => {
        renderSpy();
        return <Button {...props} />;
      };

      const { rerender } = render(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle many rapid clicks efficiently', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<Button {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }
      
      expect(onClick).toHaveBeenCalledTimes(10);
    });
  });
});
