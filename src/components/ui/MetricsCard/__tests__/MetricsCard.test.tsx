import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MetricsCard } from '../MetricsCard';

// Mock the Icon component
jest.mock('../../Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>
}));

describe('MetricsCard Component', () => {
  const defaultProps = {
    title: 'Total Users',
    value: 1500,
    icon: 'user' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with basic props', () => {
      render(<MetricsCard {...defaultProps} />);
      
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('$1.5K')).toBeInTheDocument();
      expect(screen.getByTestId('icon-user')).toBeInTheDocument();
    });
  });
});
