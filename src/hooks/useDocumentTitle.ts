import { useEffect } from 'react';

/**
 * Hook to manage document title for accessibility and SEO
 * Updates the page title when components mount/unmount
 */
export const useDocumentTitle = (title: string, restore = true) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} - User Lens`;

    return () => {
      if (restore) {
        document.title = originalTitle;
      }
    };
  }, [title, restore]);
};
