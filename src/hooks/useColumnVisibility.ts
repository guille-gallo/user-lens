import { useState, useCallback } from 'react';
import type { ColumnDefinition } from '../components/ui/ColumnToggle';

/**
 * Custom hook for managing column visibility state
 * Extracts column visibility logic from DataTable component
 */
export const useColumnVisibility = (initialColumns: any[]) => {
  const [columnVisibility, setColumnVisibility] = useState<ColumnDefinition[]>(() =>
    initialColumns.map(col => ({
      key: col.key,
      label: col.label,
      visible: col.defaultVisible || col.essential || false,
      essential: col.essential
    }))
  );

  /**
   * Toggle visibility of a specific column
   */
  const toggleColumn = useCallback((columnKey: string) => {
    setColumnVisibility(prev => 
      prev.map(col => 
        col.key === columnKey && !col.essential 
          ? { ...col, visible: !col.visible }
          : col
      )
    );
  }, []);

  /**
   * Show all non-essential columns
   */
  const selectAllColumns = useCallback(() => {
    setColumnVisibility(prev => 
      prev.map(col => ({ ...col, visible: true }))
    );
  }, []);

  /**
   * Hide all non-essential columns
   */
  const unselectAllColumns = useCallback(() => {
    setColumnVisibility(prev => 
      prev.map(col => 
        col.essential 
          ? col 
          : { ...col, visible: false }
      )
    );
  }, []);

  /**
   * Get currently visible columns
   */
  const getVisibleColumns = useCallback(() => {
    const visibleColumnKeys = columnVisibility
      .filter(col => col.visible)
      .map(col => col.key);
    
    return initialColumns.filter(col => visibleColumnKeys.includes(col.key));
  }, [columnVisibility, initialColumns]);

  return {
    columnVisibility,
    toggleColumn,
    selectAllColumns,
    unselectAllColumns,
    getVisibleColumns
  };
};
