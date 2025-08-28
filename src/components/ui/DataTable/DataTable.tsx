import React, { useMemo } from 'react';
import { Icon } from '../Icon';
import type { User } from '../../../services/userService';
import './DataTable.scss';

type SortOrder = 'asc' | 'desc';
type SortableFields = 'name' | 'username' | 'email' | 'phone' | 'website' | 'company';

interface DataTableColumn {
  key: SortableFields;
  label: string;
  sortable?: boolean;
  render?: (value: any, user: User) => React.ReactNode;
}

interface DataTableProps {
  users: User[];
  loading?: boolean;
  onSort?: (field: SortableFields, order: SortOrder) => void;
  sortField?: SortableFields | null;
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
  const columns: DataTableColumn[] = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
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
      render: (website: string) => (
        <a 
          href={`https://${website}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="data-table__website-link"
        >
          {website}
        </a>
      )
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (company: User['company']) => company.name
    }
  ], []);

  const handleSort = (field: SortableFields) => {
    if (!onSort) return;
    
    let newOrder: SortOrder = 'asc';
    if (sortField === field && sortOrder === 'asc') {
      newOrder = 'desc';
    }
    
    onSort(field, newOrder);
  };

  const getSortIcon = (field: SortableFields) => {
    if (sortField !== field) {
      return <Icon name="chevrons-up-down" size={14} className="data-table__sort-icon--neutral" />;
    }
    return sortOrder === 'asc' ? 
      <Icon name="chevron-up" size={14} className="data-table__sort-icon--asc" /> : 
      <Icon name="chevron-down" size={14} className="data-table__sort-icon--desc" />;
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
      <div className="data-table__wrapper">
        <table className="data-table__table" role="table">
          <thead>
            <tr>
              {columns.map((column) => (
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
                {columns.map((column) => (
                  <td key={column.key} className="data-table__cell">
                    {column.render 
                      ? column.render(user[column.key], user)
                      : String(user[column.key])
                    }
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
    </div>
  );
};
