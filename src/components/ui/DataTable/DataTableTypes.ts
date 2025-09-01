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
  loading?: boolean;
  onSort?: (field: string, order: SortOrder) => void;
  sortField?: string | null;
  sortOrder?: SortOrder;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  className?: string;
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
