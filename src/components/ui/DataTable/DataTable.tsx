import React, { useMemo } from 'react';
import type { User } from '../../../services/userService';
import { Button } from '../Button';
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
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
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
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => onView(user)}
                        aria-label={`View ${user.name}`}
                      >
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => onEdit(user)}
                        aria-label={`Edit ${user.name}`}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="small"
                        className="button--danger"
                        onClick={() => onDelete(user)}
                        aria-label={`Delete ${user.name}`}
                      >
                        Delete
                      </Button>
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
