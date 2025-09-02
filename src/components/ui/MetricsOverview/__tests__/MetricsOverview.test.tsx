import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MetricsOverview } from '../MetricsOverview';
import type { UserMetricsSummary } from '../../../../types';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const { BrowserRouter } = require('react-router-dom');

jest.mock('../../../../store', () => ({
  useUserStore: jest.fn()
}));

jest.mock('../../MetricsCard', () => ({
  MetricsCard: ({ title, value, subtitle, onSubtitleClick }: any) => (
    <div data-testid="metrics-card">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-value">{value}</div>
      {subtitle && (
        <div 
          data-testid="card-subtitle" 
          onClick={onSubtitleClick}
          style={{ cursor: onSubtitleClick ? 'pointer' : 'default' }}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}));

jest.mock('../../Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`}>{name}</span>
}));

describe('MetricsOverview Component', () => {
  const mockNavigate = jest.fn();
  const mockSetSearchTerm = jest.fn();
  
  const defaultSummary: UserMetricsSummary = {
    totalUsers: 1250,
    activeUsers: {
      count: 850,
      percentage: 68
    },
    userGrowth: {
      newUsers: 45,
      growthRate: 5.2
    },
    topCompany: {
      name: 'TechCorp Inc.',
      userCount: 85
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useNavigate
    const mockRouterDom = require('react-router-dom');
    mockRouterDom.useNavigate.mockReturnValue(mockNavigate);
    
    // Mock useUserStore
    const mockStore = require('../../../../store');
    mockStore.useUserStore.mockReturnValue({
      setSearchTerm: mockSetSearchTerm
    });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  describe('Loading State', () => {
    it('should render loading state', () => {
      renderWithRouter(<MetricsOverview summary={null} loading={true} />);
      
      expect(screen.getByText('User Metrics')).toBeInTheDocument();
      
      const toggleButton = screen.getByLabelText('Collapse metrics');
      expect(toggleButton).toBeDisabled();
      
      // Check for skeleton loaders instead of text
      const skeletons = document.querySelectorAll('.metrics-overview__skeleton');
      expect(skeletons).toHaveLength(3);
    });

    it('should show loading skeleton in expanded state', () => {
      renderWithRouter(<MetricsOverview summary={null} loading={true} />);
      
      // Check for skeleton loaders instead of loading spinner
      const skeletons = document.querySelectorAll('.metrics-overview__skeleton');
      expect(skeletons).toHaveLength(3);
      
      const loadingContainer = document.querySelector('.metrics-overview__loading');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error state', () => {
      renderWithRouter(
        <MetricsOverview 
          summary={null} 
          loading={false} 
          error="Failed to load metrics" 
        />
      );
      
      expect(screen.getByText('User Metrics')).toBeInTheDocument();
      expect(screen.getByText('Unable to load user metrics')).toBeInTheDocument();
    });

    it('should handle different error messages', () => {
      const errorMessages = [
        'Network error',
        'Server unavailable',
        'Timeout occurred'
      ];

      errorMessages.forEach((error, index) => {
        if (index > 0) cleanup(); // Clean up between renders except first
        renderWithRouter(
          <MetricsOverview summary={null} loading={false} error={error} />
        );
        // Error component shows generic message, not the specific error
        expect(screen.getByText('Unable to load user metrics')).toBeInTheDocument();
      });
    });
  });

  describe('Success State with Data', () => {
    it('should render metrics cards with summary data', () => {
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      // Check that all metrics cards are rendered (only 3 cards in actual implementation)
      const cards = screen.getAllByTestId('metrics-card');
      expect(cards).toHaveLength(3);
      
      // Check specific metric values
      expect(screen.getByText('1250')).toBeInTheDocument(); // Total users
      expect(screen.getByText('68%')).toBeInTheDocument(); // Active users percentage
      expect(screen.getByText('85')).toBeInTheDocument(); // Top company count
    });

    it('should render correct titles for metrics cards', () => {
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Top Company')).toBeInTheDocument();
    });

    it('should render correct subtitles for company card', () => {
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      expect(screen.getByText('TechCorp Inc. (85 users)')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should be expanded by default', () => {
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const cards = screen.getAllByTestId('metrics-card');
      expect(cards).toHaveLength(3);
      
      const toggleButton = screen.getByLabelText('Collapse metrics');
      expect(toggleButton).toBeInTheDocument();
      expect(screen.getByTestId('icon-chevron-up')).toBeInTheDocument();
    });

    it('should collapse when toggle button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const toggleButton = screen.getByLabelText('Collapse metrics');
      await user.click(toggleButton);
      
      await waitFor(() => {
        const cards = screen.queryAllByTestId('metrics-card');
        expect(cards).toHaveLength(0);
      });
      
      expect(screen.getByLabelText('Expand metrics')).toBeInTheDocument();
      expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument();
    });

    it('should expand when clicked again', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const toggleButton = screen.getByLabelText('Collapse metrics');
      
      // Collapse
      await user.click(toggleButton);
      await waitFor(() => {
        expect(screen.queryAllByTestId('metrics-card')).toHaveLength(0);
      });
      
      // Expand
      const expandButton = screen.getByLabelText('Expand metrics');
      await user.click(expandButton);
      
      await waitFor(() => {
        const cards = screen.getAllByTestId('metrics-card');
        expect(cards).toHaveLength(3);
      });
    });

    it('should maintain state across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      // Collapse
      const toggleButton = screen.getByLabelText('Collapse metrics');
      await user.click(toggleButton);
      
      // Re-render with same props
      rerender(<BrowserRouter><MetricsOverview summary={defaultSummary} /></BrowserRouter>);
      
      // Should still be collapsed
      expect(screen.queryAllByTestId('metrics-card')).toHaveLength(0);
      expect(screen.getByLabelText('Expand metrics')).toBeInTheDocument();
    });
  });

  describe('Company Click Navigation', () => {
    it('should navigate to users page and set search term when company is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const companySubtitle = screen.getByText('TechCorp Inc. (85 users)');
      await user.click(companySubtitle);
      
      expect(mockSetSearchTerm).toHaveBeenCalledWith('TechCorp Inc.');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle company click with different company names', async () => {
      const user = userEvent.setup();
      const customSummary = {
        ...defaultSummary,
        topCompany: {
          name: 'Different Corp',
          userCount: 100
        }
      };
      
      renderWithRouter(<MetricsOverview summary={customSummary} />);
      
      const companySubtitle = screen.getByText('Different Corp (100 users)');
      await user.click(companySubtitle);
      
      expect(mockSetSearchTerm).toHaveBeenCalledWith('Different Corp');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null summary gracefully', () => {
      renderWithRouter(<MetricsOverview summary={null} />);
      
      // Should render nothing when summary is null (component returns null)
      expect(screen.queryByText('User Metrics')).not.toBeInTheDocument();
      expect(screen.queryAllByTestId('metrics-card')).toHaveLength(0);
    });

    it('should handle zero values in summary', () => {
      const zeroSummary: UserMetricsSummary = {
        totalUsers: 0,
        activeUsers: { count: 0, percentage: 0 },
        userGrowth: { newUsers: 0, growthRate: 0 },
        topCompany: { name: 'No Company', userCount: 0 }
      };
      
      renderWithRouter(<MetricsOverview summary={zeroSummary} />);
      
      const cards = screen.getAllByTestId('metrics-card');
      expect(cards).toHaveLength(3);
      
      // Check that zero values are displayed using getAllByText to handle multiple occurrences
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
      
      // Verify specific zero displays
      expect(screen.getByText('0 registered users')).toBeInTheDocument();
      expect(screen.getByText('0 of 0 users')).toBeInTheDocument();
      expect(screen.getByText('No Company (0 users)')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const largeSummary: UserMetricsSummary = {
        totalUsers: 1000000,
        activeUsers: { count: 800000, percentage: 80 },
        userGrowth: { newUsers: 50000, growthRate: 25.5 },
        topCompany: { name: 'Mega Corp', userCount: 500000 }
      };
      
      renderWithRouter(<MetricsOverview summary={largeSummary} />);
      
      expect(screen.getByText('1000000')).toBeInTheDocument();
      expect(screen.getByText('500000')).toBeInTheDocument();
    });

    it('should handle special characters in location names', () => {
      const specialSummary: UserMetricsSummary = {
        ...defaultSummary,
        topCompany: { name: 'Äcme Corp & Co.', userCount: 50 }
      };
      
      renderWithRouter(<MetricsOverview summary={specialSummary} />);
      
      expect(screen.getByText('Äcme Corp & Co. (50 users)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for toggle button', () => {
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const toggleButton = screen.getByLabelText('Collapse metrics');
      expect(toggleButton).toHaveAttribute('aria-label', 'Collapse metrics');
    });

    it('should update ARIA label when collapsed/expanded', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      let toggleButton = screen.getByLabelText('Collapse metrics');
      await user.click(toggleButton);
      
      toggleButton = screen.getByLabelText('Expand metrics');
      expect(toggleButton).toHaveAttribute('aria-label', 'Expand metrics');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const toggleButton = screen.getByLabelText('Collapse metrics');
      
      // Focus and activate with keyboard
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.queryAllByTestId('metrics-card')).toHaveLength(0);
      });
    });

    it('should have proper semantic structure', () => {
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const title = screen.getByText('User Metrics');
      expect(title.tagName).toBe('H2');
      expect(title).toHaveClass('metrics-overview__title');
    });
  });

  describe('Component State Management', () => {
    it('should handle rapid toggle clicks', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      const toggleButton = screen.getByLabelText('Collapse metrics');
      
      // Rapid clicks
      await user.click(toggleButton);
      await user.click(screen.getByLabelText('Expand metrics'));
      await user.click(screen.getByLabelText('Collapse metrics'));
      
      // Should end up collapsed
      await waitFor(() => {
        expect(screen.queryAllByTestId('metrics-card')).toHaveLength(0);
      });
    });

    it('should handle props updates while collapsed', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithRouter(<MetricsOverview summary={defaultSummary} />);
      
      // Collapse first
      const toggleButton = screen.getByLabelText('Collapse metrics');
      await user.click(toggleButton);
      
      // Update summary while collapsed
      const newSummary = { ...defaultSummary, totalUsers: 2000 };
      rerender(<BrowserRouter><MetricsOverview summary={newSummary} /></BrowserRouter>);
      
      // Expand to see updated data
      const expandButton = screen.getByLabelText('Expand metrics');
      await user.click(expandButton);
      
      await waitFor(() => {
        expect(screen.getByText('2000')).toBeInTheDocument();
      });
    });
  });
});
