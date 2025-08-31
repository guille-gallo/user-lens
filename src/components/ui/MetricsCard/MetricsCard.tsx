import React from 'react';
import { Icon } from '../Icon';
import './MetricsCard.scss';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
  onSubtitleClick?: () => void;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'primary',
  className = '',
  onSubtitleClick
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers (market values)
      if (val >= 1000000000) {
        return `$${(val / 1000000000).toFixed(1)}B`;
      } else if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `$${(val / 1000).toFixed(1)}K`;
      }
      return val.toString();
    }
    return val;
  };

  return (
    <div className={`metrics-card metrics-card--${variant} ${className}`}>
      <div className="metrics-card__header">
        <Icon name={icon as any} size={20} className="metrics-card__icon" />
        <h3 className="metrics-card__title">{title}</h3>
      </div>
      <div className="metrics-card__content">
        <div className="metrics-card__value">{formatValue(value)}</div>
        {subtitle && (
          <div 
            className={`metrics-card__subtitle ${onSubtitleClick ? 'metrics-card__subtitle--clickable' : ''}`}
            onClick={onSubtitleClick}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
