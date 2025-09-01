import React, { useMemo } from 'react';
import type { User } from '../types';

interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  essential?: boolean;
  defaultVisible?: boolean;
  render?: (value: unknown, user: User) => React.ReactNode;
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
      render: (email: unknown) => (
        <a href={`mailto:${String(email)}`} className="data-table__email-link">
          {String(email)}
        </a>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      essential: false,
      defaultVisible: true,
      render: (phone: unknown) => (
        <a href={`tel:${String(phone)}`} className="data-table__phone-link">
          {String(phone)}
        </a>
      )
    },
    {
      key: 'website',
      label: 'Website',
      sortable: true,
      essential: false,
      defaultVisible: false,
      render: (website: unknown) => (
        <a 
          href={`https://${String(website)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="data-table__website-link"
        >
          {String(website)} ↗
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
