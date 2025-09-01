import { useState, useEffect } from 'react';
import { debounce } from '../utils';

/**
 * Custom hook to detect screen size changes
 * Used by ResponsiveEditingContainer to determine mobile vs desktop layout
 */
export const useScreenSize = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events with debouncing for performance
    const debouncedCheck = debounce(checkScreenSize, 100);

    window.addEventListener('resize', debouncedCheck);
    
    return () => {
      window.removeEventListener('resize', debouncedCheck);
    };
  }, [breakpoint]);

  return { isMobile };
};
