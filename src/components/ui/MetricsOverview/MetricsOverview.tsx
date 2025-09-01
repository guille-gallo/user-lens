import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../store';
import { MetricsCard } from '../MetricsCard';
import { Icon } from '../Icon';
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
  const [isExpanded, setIsExpanded] = useState(true);

  // Function to search for all users by company name
  const handleCompanyClick = (companyName: string) => {
    // Set search term to company name to filter users by company
    setSearchTerm(companyName);
    // Navigate to main users page where the search will be applied
    navigate('/');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return (
      <div className="metrics-overview">
        <div className="metrics-overview__header">
          <h2 className="metrics-overview__title">User Metrics</h2>
          <button
            className="metrics-overview__toggle"
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Collapse metrics' : 'Expand metrics'}
            disabled
          >
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} />
          </button>
        </div>
        {isExpanded && (
          <div className="metrics-overview__loading">
            <div className="metrics-overview__skeleton"></div>
            <div className="metrics-overview__skeleton"></div>
            <div className="metrics-overview__skeleton"></div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-overview">
        <div className="metrics-overview__header">
          <h2 className="metrics-overview__title">User Metrics</h2>
          <button
            className="metrics-overview__toggle"
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Collapse metrics' : 'Expand metrics'}
          >
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} />
          </button>
        </div>
        {isExpanded && (
          <div className="metrics-overview__error">
            <p>Unable to load user metrics</p>
          </div>
        )}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="metrics-overview">
      <div className="metrics-overview__header">
        <h2 className="metrics-overview__title">User Metrics</h2>
        <button
          className="metrics-overview__toggle"
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Collapse metrics' : 'Expand metrics'}
        >
          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} />
        </button>
      </div>
      {isExpanded && (
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
      )}
    </div>
  );
};
