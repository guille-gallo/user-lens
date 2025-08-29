import React, { useMemo, useState } from 'react';
import { Icon } from '../Icon';
import { ColumnToggle, type ColumnDefinition } from '../ColumnToggle';
import type { User } from '../../../services/userService';
import './DataTable.scss';

type SortOrder = 'asc' | 'desc';

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  essential?: boolean; // Cannot be hidden
  defaultVisible?: boolean;
  render?: (value: any, user: User) => React.ReactNode;
}

interface DataTableProps {
  users: User[];
  loading?: boolean;
  onSort?: (field: string, order: SortOrder) => void;
  sortField?: string | null;
  sortOrder?: SortOrder;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  className?: string;
}

/**
 * DataTable component
 */
export const DataTable: React.FC<DataTableProps> = ({
  users,
  loading = false,
  onSort,
  sortField,
  sortOrder,
  onEdit,
  onDelete,
  onView,
  className = ''
}) => {
  // Define all available columns
  const allColumns: DataTableColumn[] = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      essential: true,
      defaultVisible: true,
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      essential: false,
      defaultVisible: true,
      render: (username: string) => `@${username}`
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      essential: false,
      defaultVisible: true,
      render: (email: string) => (
        <a href={`mailto:${email}`} className="data-table__email-link">
          {email}
        </a>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      essential: false,
      defaultVisible: true,
      render: (phone: string) => (
        <a href={`tel:${phone}`} className="data-table__phone-link">
          {phone}
        </a>
      )
    },
    {
      key: 'website',
      label: 'Website',
      sortable: true,
      essential: false,
      defaultVisible: false,
      render: (website: string) => (
        <a 
          href={`https://${website}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="data-table__website-link"
        >
          {website} ↗
        </a>
      )
    },
    {
      key: 'address.street',
      label: 'Street',
      sortable: false,
      essential: false,
      defaultVisible: false,
      render: (_, user: User) => `${user.address.street} ${user.address.suite}`
    },
    {
      key: 'address.city',
      label: 'City',
      sortable: true,
      essential: false,
      defaultVisible: false,
      render: (_, user: User) => user.address.city
    },
    {
      key: 'address.zipcode',
      label: 'Zip Code',
      sortable: true,
      essential: false,
      defaultVisible: false,
      render: (_, user: User) => user.address.zipcode
    },
    {
      key: 'address.geo',
      label: 'Coordinates',
      sortable: false,
      essential: false,
      defaultVisible: false,
      render: (_, user: User) => `${user.address.geo.lat}, ${user.address.geo.lng}`
    },
    {
      key: 'company.name',
      label: 'Company',
      sortable: true,
      essential: false,
      defaultVisible: true,
      render: (_, user: User) => user.company.name
    },
    {
      key: 'company.catchPhrase',
      label: 'Catch Phrase',
      sortable: false,
      essential: false,
      defaultVisible: false,
      render: (_, user: User) => `"${user.company.catchPhrase}"`
    },
    {
      key: 'company.bs',
      label: 'Business',
      sortable: false,
      essential: false,
      defaultVisible: false,
      render: (_, user: User) => user.company.bs
    }
  ], []);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<ColumnDefinition[]>(() =>
    allColumns.map(col => ({
      key: col.key,
      label: col.label,
      visible: col.defaultVisible || col.essential || false,
      essential: col.essential
    }))
  );

  // Mobile card expansion state
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Get visible columns
  const visibleColumns = useMemo(() => 
    allColumns.filter(col => 
      columnVisibility.find(vis => vis.key === col.key)?.visible
    ), [allColumns, columnVisibility]);

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility(prev => 
      prev.map(col => 
        col.key === columnKey 
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  };

  const handleSelectAllColumns = () => {
    setColumnVisibility(prev => 
      prev.map(col => ({ ...col, visible: true }))
    );
  };

  const handleUnselectAllColumns = () => {
    setColumnVisibility(prev => 
      prev.map(col => 
        col.essential 
          ? col //keep essential columns visible
          : { ...col, visible: false }
      )
    );
  };

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

  const handleSort = (field: string) => {
    if (!onSort) return;
    
    let newOrder: SortOrder = 'asc';
    if (sortField === field && sortOrder === 'asc') {
      newOrder = 'desc';
    }
    
    onSort(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <Icon name="chevrons-up-down" size={14} className="data-table__sort-icon--neutral" />;
    }
    return sortOrder === 'asc' ? 
      <Icon name="chevron-up" size={14} className="data-table__sort-icon--asc" /> : 
      <Icon name="chevron-down" size={14} className="data-table__sort-icon--desc" />;
  };

  const getCellValue = (user: User, column: DataTableColumn) => {
    // Handle nested property access first to get the actual value
    const keys = column.key.split('.');
    let value: any = user;
    for (const key of keys) {
      value = value?.[key];
    }
    
    if (column.render) {
      return column.render(value, user);
    }
    
    return String(value || '');
  };

  if (loading) {
    return (
      <div className={`data-table ${className}`}>
        <div className="data-table__loading">
          <div className="data-table__spinner">⟳</div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={`data-table ${className}`}>
        <div className="data-table__empty">
          <p>No users found</p>
          <small>Try adjusting your search criteria</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      <div className="data-table__toolbar">
        <div className="data-table__toolbar-left">
          <span className="data-table__count">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="data-table__toolbar-right">
          <div className="data-table__column-toggle-wrapper">
            <ColumnToggle
              columns={columnVisibility}
              onToggle={handleColumnToggle}
              onSelectAll={handleSelectAllColumns}
              onUnselectAll={handleUnselectAllColumns}
            />
          </div>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="data-table__wrapper">
        <table className="data-table__table" role="table">
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.key} className="data-table__header-cell">
                  {column.sortable ? (
                    <button
                      className="data-table__sort-button"
                      onClick={() => handleSort(column.key)}
                      aria-label={`Sort by ${column.label}`}
                    >
                      <span>{column.label}</span>
                      <span className="data-table__sort-icon" aria-hidden="true">
                        {getSortIcon(column.key)}
                      </span>
                    </button>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </th>
              ))}
              <th className="data-table__header-cell data-table__header-cell--actions">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="data-table__row">
                {visibleColumns.map((column) => (
                  <td key={column.key} className="data-table__cell">
                    {getCellValue(user, column)}
                  </td>
                ))}
                <td className="data-table__cell data-table__cell--actions">
                  <div className="data-table__actions">
                    {onView && (
                      <button
                        className="data-table__action-btn data-table__action-btn--view"
                        onClick={() => onView(user)}
                        aria-label={`View ${user.name} details`}
                        title="View details"
                      >
                        <Icon name="eye" size={16} />
                        <span className="data-table__action-text">View</span>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="data-table__action-btn data-table__action-btn--edit"
                        onClick={() => onEdit(user)}
                        aria-label={`Edit ${user.name}`}
                        title="Edit user"
                      >
                        <Icon name="edit" size={16} />
                        <span className="data-table__action-text">Edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="data-table__action-btn data-table__action-btn--delete"
                        onClick={() => onDelete(user)}
                        aria-label={`Delete ${user.name}`}
                        title="Delete user"
                      >
                        <Icon name="trash" size={16} />
                        <span className="data-table__action-text">Delete</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="data-table__mobile-cards">
        {users.map((user) => {
          const expanded = isCardExpanded(user.id);
          
          return (
            <div key={user.id} className={`data-table__card ${expanded ? 'data-table__card--expanded' : ''}`}>
              <div className="data-table__card-header">
                <div className="data-table__card-title">
                  <h3 className="data-table__card-name">{user.name}</h3>
                  <span className="data-table__card-username">@{user.username}</span>
                </div>
                <div className="data-table__card-actions">
                  <button
                    className="data-table__card-expand"
                    onClick={() => toggleCardExpansion(user.id)}
                    aria-label={expanded ? `Collapse ${user.name} details` : `Expand ${user.name} details`}
                    title={expanded ? "Show less" : "Show more"}
                  >
                    <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} />
                  </button>
                  {onView && (
                    <button
                      className="data-table__card-action data-table__card-action--view"
                      onClick={() => onView(user)}
                      aria-label={`View ${user.name} details`}
                      title="View details"
                    >
                      <Icon name="eye" size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="data-table__card-action data-table__card-action--edit"
                      onClick={() => onEdit(user)}
                      aria-label={`Edit ${user.name}`}
                      title="Edit user"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="data-table__card-action data-table__card-action--delete"
                      onClick={() => onDelete(user)}
                      aria-label={`Delete ${user.name}`}
                      title="Delete user"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  )}
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
    </div>
  );
};
