import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../store/userStore';
import { MetricsCard } from '../MetricsCard';
import type { MetricsSummary } from '../../../services/companyMetricsService';
import './MetricsOverview.scss';

interface MetricsOverviewProps {
  summary: MetricsSummary | null;
  loading?: boolean;
  error?: string | null;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  summary,
  loading = false,
  error = null
}) => {
  const navigate = useNavigate();
  const { users } = useUserStore();

  // Function to find a user by company name and navigate to their detail page
  const handleCompanyClick = (companyName: string) => {
    const user = users.find(user => user.company.name === companyName);
    if (user) {
      navigate(`/users/${user.id}`);
    } else {
      // If no user found, navigate to the main page and set search for the company
      navigate('/');
      // Note: You could also set a search term in the store here if needed
    }
  };

  if (loading) {
    return (
      <div className="metrics-overview">
        <div className="metrics-overview__loading">
          <div className="metrics-overview__skeleton"></div>
          <div className="metrics-overview__skeleton"></div>
          <div className="metrics-overview__skeleton"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-overview">
        <div className="metrics-overview__error">
          <p>Unable to load company metrics</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="metrics-overview">
      <div className="metrics-overview__cards">
        <MetricsCard
          title="Most Valuable Company"
          value={summary.mostValuableCompany.marketValue}
          subtitle={summary.mostValuableCompany.name}
          icon="building"
          variant="primary"
          onSubtitleClick={() => handleCompanyClick(summary.mostValuableCompany.name)}
        />
        
        <MetricsCard
          title="Top Stock Price"
          value={`$${summary.topStockPrice.price}`}
          subtitle={summary.topStockPrice.company}
          icon="chevrons-up-down"
          variant="success"
        />
        
        <MetricsCard
          title="Company Rating"
          value={`${summary.mostValuableCompanyRating}/5`}
          subtitle={`${summary.mostValuableCompany.name} internal rating`}
          icon="check-circle"
          variant="warning"
        />
      </div>
    </div>
  );
};
