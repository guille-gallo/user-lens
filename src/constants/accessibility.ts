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
  USER_ACTIONS: 'User actions'
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
