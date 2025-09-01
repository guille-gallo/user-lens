import React from 'react';
import { Icon } from '../Icon';
import './SearchBar.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * SearchBar component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = ""
}) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`search-bar ${className}`}>
      <div className="search-bar__input-wrapper">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-bar__input"
          aria-label="Search input"
          role="searchbox"
        />
        <div className="search-bar__icons">
          {value && (
            <button
              onClick={handleClear}
              className="search-bar__clear"
              aria-label="Clear search"
              type="button"
            >
              <Icon name="close" />
            </button>
          )}
          <div className="search-bar__search-icon" aria-hidden="true">
            <Icon name="search" />
          </div>
        </div>
      </div>
    </div>
  );
};
