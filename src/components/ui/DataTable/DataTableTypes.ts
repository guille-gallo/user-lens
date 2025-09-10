import type { User } from '../../../types';

export type SortOrder = 'asc' | 'desc';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  essential?: boolean; // Cannot be hidden
  defaultVisible?: boolean;
  render?: (value: unknown, user: User) => React.ReactNode;
}

export interface DataTableProps {
  users: User[];
  totalUsers?: number; // Total count for display, falls back to users.length
  loading?: boolean;
  isSearchPending?: boolean; // New prop for skeleton state during search
  onSort?: (field: string, order: SortOrder) => void;
  sortField?: string | null;
  sortOrder?: SortOrder;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  className?: string;
  pageSize?: number; // Number of rows per page for skeleton sizing
}

export interface DataTableBaseProps extends Omit<DataTableProps, 'className'> {
  visibleColumns: DataTableColumn[];
  allColumns: DataTableColumn[];
}

export interface DataTableActionsProps {
  user: User;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  variant?: 'desktop' | 'mobile';
}
