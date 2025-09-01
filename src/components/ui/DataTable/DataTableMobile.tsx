import React, { useState } from 'react';
import { Icon } from '../Icon';
import { DataTableActions } from './DataTableActions';
import type { DataTableBaseProps } from './DataTableTypes';

/**
 * DataTableMobile - Mobile card view component
 * Handles card-based layout with expandable details
 * Follows Single Responsibility Principle - only handles mobile card view
 */
export const DataTableMobile: React.FC<DataTableBaseProps> = ({
  users,
  onEdit,
  onDelete,
  onView
}) => {
  // Mobile card expansion state
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCardExpansion = (userId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const isCardExpanded = (userId: number) => expandedCards.has(userId);

  return (
    <div className="data-table__mobile-cards">
      {users.map((user) => {
        const expanded = isCardExpanded(user.id);
        
        return (
          <div key={user.id} className={`data-table__card ${expanded ? 'data-table__card--expanded' : ''}`}>
            <div className="data-table__card-header">
              <div className="data-table__card-title">
                <button
                  className="data-table__card-expand"
                  onClick={() => toggleCardExpansion(user.id)}
                  aria-label={expanded ? `Collapse ${user.name} details` : `Expand ${user.name} details`}
                  title={expanded ? "Show less" : "Show more"}
                  type="button"
                >
                  <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} />
                </button>
                <div className="data-table__card-user-info">
                  <h3 className="data-table__card-name">{user.name}</h3>
                  <span className="data-table__card-username">@{user.username}</span>
                </div>
              </div>
              <div className="data-table__card-actions">
                <DataTableActions
                  user={user}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  variant="mobile"
                />
              </div>
            </div>
            
            <div className="data-table__card-content">
              {/* Essential fields - always visible */}
              <div className="data-table__card-essential">
                <div className="data-table__card-field">
                  <span className="data-table__card-label">Email</span>
                  <a 
                    href={`mailto:${user.email}`} 
                    className="data-table__card-value data-table__card-value--link"
                  >
                    {user.email}
                  </a>
                </div>
                
                <div className="data-table__card-field">
                  <span className="data-table__card-label">Company</span>
                  <span className="data-table__card-value">{user.company.name}</span>
                </div>
              </div>

              {/* Expandable fields - shown when expanded */}
              <div className={`data-table__card-expandable ${expanded ? 'data-table__card-expandable--visible' : ''}`}>
                <div className="data-table__card-field">
                  <span className="data-table__card-label">Phone</span>
                  <a 
                    href={`tel:${user.phone}`} 
                    className="data-table__card-value data-table__card-value--link"
                  >
                    {user.phone}
                  </a>
                </div>
                
                <div className="data-table__card-field">
                  <span className="data-table__card-label">Website</span>
                  <a 
                    href={`https://${user.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="data-table__card-value data-table__card-value--link"
                  >
                    {user.website} ↗
                  </a>
                </div>
                
                <div className="data-table__card-field">
                  <span className="data-table__card-label">Address</span>
                  <span className="data-table__card-value">
                    {user.address.street} {user.address.suite}, {user.address.city} {user.address.zipcode}
                  </span>
                </div>
                
                <div className="data-table__card-field">
                  <span className="data-table__card-label">Catch Phrase</span>
                  <span className="data-table__card-value">"{user.company.catchPhrase}"</span>
                </div>
                
                <div className="data-table__card-field">
                  <span className="data-table__card-label">Business</span>
                  <span className="data-table__card-value">{user.company.bs}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
