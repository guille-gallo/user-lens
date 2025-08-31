import { useState, useCallback } from 'react';

interface ToastState {
  isVisible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Custom hook for managing toast notifications
 * Separates toast state logic from components
 */
export const useToast = (autoHideDuration = 3000) => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  /**
   * Show toast notification
   */
  const showToast = useCallback((
    message: string, 
    type: ToastState['type'] = 'success'
  ) => {
    setToast({
      isVisible: true,
      message,
      type
    });

    // Auto-hide after duration
    if (autoHideDuration > 0) {
      setTimeout(() => {
        hideToast();
      }, autoHideDuration);
    }
  }, [autoHideDuration]);

  /**
   * Hide toast notification
   */
  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  /**
   * Show success toast
   */
  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  /**
   * Show error toast
   */
  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  /**
   * Show warning toast
   */
  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  /**
   * Show info toast
   */
  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
