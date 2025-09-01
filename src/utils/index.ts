// Utility functions export barrel
export * from './dataTransforms';
export * from './validation';

/**
 * Checks if geographic coordinates are valid and usable for maps
 * @param lat - Latitude value
 * @param lng - Longitude value
 * @returns true if coordinates are valid and non-zero
 */
export const hasValidCoordinates = (lat?: string | null, lng?: string | null): boolean => {
  if (!lat || !lng) return false;
  
  const cleanLat = lat.trim();
  const cleanLng = lng.trim();
  
  if (cleanLat === '' || cleanLng === '' || cleanLat === '0' || cleanLng === '0') {
    return false;
  }
  
  // Additional validation: check if they're valid numbers within reasonable ranges
  const numLat = parseFloat(cleanLat);
  const numLng = parseFloat(cleanLng);
  
  if (isNaN(numLat) || isNaN(numLng)) return false;
  
  // Valid latitude range: -90 to 90, valid longitude range: -180 to 180
  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
};

/**
 * Scrolls to and focuses on the first error field in a form
 * @param errors - Object containing field errors
 * @param focusDelay - Delay before focusing (default: 100ms)
 */
export const focusFirstErrorField = (errors: Record<string, string>, focusDelay: number = 100): void => {
  const errorFields = Object.keys(errors).filter(field => errors[field]);
  
  if (errorFields.length === 0) return;
  
  const firstErrorField = errorFields[0];
  
  setTimeout(() => {
    const element = document.getElementById(firstErrorField);
    if (element) {
      // Find the label text for better accessibility announcement
      const label = document.querySelector(`label[for="${firstErrorField}"]`)?.textContent || firstErrorField;
      
      // Scroll to the element with smooth behavior
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Focus the element after a short delay to ensure scroll completes
      setTimeout(() => {
        element.focus();
        
        // Add a subtle highlight effect
        element.style.outline = '2px solid #3b82f6';
        element.style.outlineOffset = '2px';
        element.style.transition = 'outline 0.2s ease';
        
        // Announce to screen readers
        const announcement = `Please correct the error in ${label}: ${errors[firstErrorField]}`;
        announceToScreenReader(announcement);
        
        // Remove the highlight after 2 seconds
        setTimeout(() => {
          element.style.outline = '';
          element.style.outlineOffset = '';
        }, 2000);
      }, 300);
    }
  }, focusDelay);
};

/**
 * Announces a message to screen readers using aria-live
 * @param message - Message to announce
 */
const announceToScreenReader = (message: string): void => {
  // Create or get existing announcement element
  let announcer = document.getElementById('error-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'error-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
  }
  
  // Clear and set the message
  announcer.textContent = '';
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
};
