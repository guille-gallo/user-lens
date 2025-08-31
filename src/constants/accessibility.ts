// Accessibility Constants
// ========================
// ARIA labels, roles, and accessibility-related constants

/**
 * ARIA labels for screen readers
 */
export const ARIA_LABELS = {
  REQUIRED_FIELD: 'required',
  SORT_ASCENDING: 'sorted ascending',
  SORT_DESCENDING: 'sorted descending',
  SORT_NONE: 'not sorted',
  LOADING: 'Loading content',
  ERROR_MESSAGE: 'Error message',
  SUCCESS_MESSAGE: 'Success message',
  SEARCH_RESULTS: 'Search results',
  USER_ACTIONS: 'User actions',
  HOME_NAVIGATION: 'Go to home page',
  PRIMARY_NAVIGATION: 'Primary navigation',
  SKIP_TO_CONTENT: 'Skip to main content',
  MAIN_CONTENT: 'Main content'
} as const;

/**
 * ARIA roles for semantic markup
 */
export const ARIA_ROLES = {
  TABLE: 'table',
  COLUMNHEADER: 'columnheader',
  CELL: 'cell',
  BUTTON: 'button',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo'
} as const;

/**
 * Live region announcements
 */
export const LIVE_REGION = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off'
} as const;

/**
 * Keyboard navigation constants
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight'
} as const;

/**
 * Table navigation accessibility constants
 */
export const TABLE_NAVIGATION = {
  CELL_TABINDEX_ACTIVE: 0,
  CELL_TABINDEX_INACTIVE: -1,
  ANNOUNCE_CELL_POSITION: 'Row {row}, Column {column}',
  ANNOUNCE_CELL_CONTENT: '{content}. {position}',
  NAVIGATION_HINT: 'Use arrow keys to navigate table cells, Tab to move to interactive elements'
} as const;
