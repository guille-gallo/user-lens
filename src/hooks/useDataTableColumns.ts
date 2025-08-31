import React, { useMemo } from 'react';
import type { User } from '../services/userService';

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  essential?: boolean;
  defaultVisible?: boolean;
  render?: (value: any, user: User) => React.ReactNode;
}

/**
 * Custom hook for DataTable column configuration
 * Separates column definitions from component presentation logic
 */
export const useDataTableColumns = (): DataTableColumn[] => {
  return useMemo(() => [
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
      sortable: true,
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
      defaultVisible: true,
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
      sortable: true,
      essential: false,
      defaultVisible: false,
      render: (_, user: User) => `"${user.company.catchPhrase}"`
    },
    {
      key: 'company.bs',
      label: 'Business',
      sortable: true,
      essential: false,
      defaultVisible: true,
      render: (_, user: User) => user.company.bs
    }
  ], []);
};

export type { DataTableColumn };
