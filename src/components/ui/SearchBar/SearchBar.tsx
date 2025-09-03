import React, { forwardRef, useId } from 'react';
import { Icon } from '../Icon';
import './SearchBar.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

/**
 * A memoized and forward-ref enabled search bar component with improved accessibility.
 */
export const SearchBar = React.memo(forwardRef<HTMLInputElement, SearchBarProps>(({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  label = "Search"
}, ref) => {
  const id = useId();

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`search-bar ${className}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="search-bar__input-wrapper">
        <input
          ref={ref}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-bar__input"
          role="searchbox"
        />
        <div className="search-bar__icons">
          {value && (
            <button
              onClick={handleClear}
              className="search-bar__clear"
              aria-label="Clear search"
            >
              <Icon name="close" />
            </button>
          )}
          <Icon name="search" className="search-bar__icon" />
        </div>
      </div>
    </div>
  );
}));

SearchBar.displayName = 'SearchBar';