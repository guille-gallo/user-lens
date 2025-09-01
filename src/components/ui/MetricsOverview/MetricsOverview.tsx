import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../store';
import { MetricsCard } from '../MetricsCard';
import type { UserMetricsSummary } from '../../../types';
import './MetricsOverview.scss';

interface MetricsOverviewProps {
  summary: UserMetricsSummary | null;
  loading?: boolean;
  error?: string | null;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  summary,
  loading = false,
  error = null
}) => {
  const navigate = useNavigate();
  const { setSearchTerm } = useUserStore();

  // Function to search for all users by company name
  const handleCompanyClick = (companyName: string) => {
    // Set search term to company name to filter users by company
    setSearchTerm(companyName);
    // Navigate to main users page where the search will be applied
    navigate('/');
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
          <p>Unable to load user metrics</p>
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
          title="Total Users"
          value={summary.totalUsers}
          subtitle={`${summary.totalUsers} registered users`}
          icon="user"
          variant="primary"
        />
        
        <MetricsCard
          title="Active Users"
          value={`${summary.activeUsers.percentage}%`}
          subtitle={`${summary.activeUsers.count} of ${summary.totalUsers} users`}
          icon="check-circle"
          variant="success"
        />
        
        <MetricsCard
          title="Top Company"
          value={summary.topCompany.userCount}
          subtitle={`${summary.topCompany.name} (${summary.topCompany.userCount} users)`}
          icon="building"
          variant="warning"
          onSubtitleClick={() => handleCompanyClick(summary.topCompany.name)}
        />
      </div>
    </div>
  );
};
