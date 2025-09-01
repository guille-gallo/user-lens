import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Simple mock component for testing
const TestButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} data-testid="test-button">
    {children}
  </button>
);

describe('Component Integration Tests', () => {
  it('should render and handle click events', async () => {
    const mockClick = jest.fn();
    render(<TestButton onClick={mockClick}>Click me</TestButton>);
    
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    
    await userEvent.click(button);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should handle user interactions', async () => {
    const mockClick = jest.fn();
    render(<TestButton onClick={mockClick}>Test</TestButton>);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(mockClick).toHaveBeenCalled();
  });
});
