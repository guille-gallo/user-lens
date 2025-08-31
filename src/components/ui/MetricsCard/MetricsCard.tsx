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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onSubtitleClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onSubtitleClick();
    }
  };

  const ariaLabel = subtitle 
    ? `${title}: ${formatValue(value)}, ${subtitle}${onSubtitleClick ? ', clickable' : ''}`
    : `${title}: ${formatValue(value)}`;

  return (
    <div 
      className={`metrics-card metrics-card--${variant} ${className}`}
      role={onSubtitleClick ? "button" : "region"}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={onSubtitleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="metrics-card__header">
        <Icon name={icon as any} size={20} className="metrics-card__icon" aria-hidden="true" />
        <h3 
          id={`metrics-card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="metrics-card__title"
        >
          {title}
        </h3>
      </div>
      <div className="metrics-card__content">
        <div className="metrics-card__value" aria-label={`${title}: ${formatValue(value)}`}>
          {formatValue(value)}
        </div>
        {subtitle && (
          onSubtitleClick ? (
            <span
              className="metrics-card__subtitle metrics-card__subtitle--clickable"
              aria-hidden="true"
            >
              {subtitle}
            </span>
          ) : (
            <div className="metrics-card__subtitle">
              {subtitle}
            </div>
          )
        )}
      </div>
    </div>
  );
};
