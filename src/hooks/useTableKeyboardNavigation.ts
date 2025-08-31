import { useState, useCallback } from 'react';
import { KEYBOARD_KEYS } from '../constants/accessibility';

interface UseTableKeyboardNavigationProps {
  rowCount: number;
  columnCount: number;
  tableId: string;
}

interface UseTableKeyboardNavigationReturn {
  focusedCell: { row: number; column: number } | null;
  getCellProps: (rowIndex: number, columnIndex: number) => {
    tabIndex: number;
    onKeyDown: (event: React.KeyboardEvent) => void;
  };
  announceRegionId: string;
}

/**
 * Simple table keyboard navigation hook
 * Provides arrow key navigation for table cells with proper tabIndex management
 */
export const useTableKeyboardNavigation = ({
  rowCount,
  columnCount,
  tableId
}: UseTableKeyboardNavigationProps): UseTableKeyboardNavigationReturn => {
  const [focusedCell, setFocusedCell] = useState<{ row: number; column: number } | null>(null);
  
  const announceRegionId = `${tableId}-announce`;

  const focusCell = useCallback((rowIndex: number, columnIndex: number) => {
    // Use a more specific selector to target the exact cell
    const cellElement = document.querySelector(
      `#${tableId} tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`
    ) as HTMLElement;
    
    if (cellElement) {
      // Ensure the cell is focusable
      if (cellElement.tabIndex === -1) {
        cellElement.tabIndex = 0;
      }
      cellElement.focus();
      setFocusedCell({ row: rowIndex, column: columnIndex });
      
      // Announce position for screen readers
      const announceElement = document.getElementById(announceRegionId);
      if (announceElement) {
        announceElement.textContent = `Row ${rowIndex + 1}, Column ${columnIndex + 1}`;
      }
    }
  }, [tableId, announceRegionId]);

  const handleKeyDown = useCallback((
    event: React.KeyboardEvent,
    currentRow: number,
    currentCol: number
  ) => {
    let newRow = currentRow;
    let newCol = currentCol;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_UP:
        newRow = Math.max(0, currentRow - 1);
        break;
      case KEYBOARD_KEYS.ARROW_DOWN:
        newRow = Math.min(rowCount - 1, currentRow + 1);
        break;
      case KEYBOARD_KEYS.ARROW_LEFT:
        newCol = Math.max(0, currentCol - 1);
        break;
      case KEYBOARD_KEYS.ARROW_RIGHT:
        newCol = Math.min(columnCount - 1, currentCol + 1);
        break;
      case 'Home':
        if (event.ctrlKey) {
          newRow = 0;
          newCol = 0;
        } else {
          newCol = 0;
        }
        break;
      case 'End':
        if (event.ctrlKey) {
          newRow = rowCount - 1;
          newCol = columnCount - 1;
        } else {
          newCol = columnCount - 1;
        }
        break;
      default:
        return; // Don't prevent default for other keys
    }

    // Only prevent default and move focus if we're actually navigating
    if (newRow !== currentRow || newCol !== currentCol) {
      event.preventDefault();
      focusCell(newRow, newCol);
    }
  }, [rowCount, columnCount, focusCell]);

  const getCellProps = useCallback((
    rowIndex: number, 
    columnIndex: number
  ) => {
    // Only the currently focused cell should be tabbable
    const isFocused = focusedCell?.row === rowIndex && focusedCell?.column === columnIndex;
    const isFirstCell = rowIndex === 0 && columnIndex === 0;
    
    const tabIndex = isFocused || (!focusedCell && isFirstCell) ? 0 : -1;
    
    return {
      tabIndex,
      onKeyDown: (event: React.KeyboardEvent) => {
        handleKeyDown(event, rowIndex, columnIndex);
      },
      onFocus: () => {
        // Update focused cell when user tabs into a cell
        setFocusedCell({ row: rowIndex, column: columnIndex });
      }
    };
  }, [focusedCell, handleKeyDown]);

  return {
    focusedCell,
    getCellProps,
    announceRegionId
  };
};

export type { UseTableKeyboardNavigationProps, UseTableKeyboardNavigationReturn };
