/**
 * Legacy header actions hook - for backward compatibility
 * @deprecated This hook is deprecated. Header actions are now managed by the Header component itself.
 * Remove usage of this hook from your components.
 */
export const useHeaderActions = () => {
  console.warn('useHeaderActions is deprecated. Header actions are now managed by the Header component.');
  
  return {
    setHeaderActions: () => {
      console.warn('setHeaderActions is deprecated. Remove this call from your component.');
    },
    clearHeaderActions: () => {
      console.warn('clearHeaderActions is deprecated. Remove this call from your component.');
    }
  };
};
