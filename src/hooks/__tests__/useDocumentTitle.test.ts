import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '../useDocumentTitle';

describe('useDocumentTitle', () => {
  const originalTitle = 'Original Title';

  beforeEach(() => {
    document.title = originalTitle;
  });

  it('should set document title with app suffix', () => {
    renderHook(() => useDocumentTitle('Test Page'));
    
    expect(document.title).toBe('Test Page - User Lens');
  });

  it('should restore original title on unmount by default', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Test Page'));
    
    expect(document.title).toBe('Test Page - User Lens');
    
    unmount();
    
    expect(document.title).toBe(originalTitle);
  });

  it('should not restore title when restore is false', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Test Page', false));
    
    expect(document.title).toBe('Test Page - User Lens');
    
    unmount();
    
    expect(document.title).toBe('Test Page - User Lens');
  });

  it('should update title when title prop changes', () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'First Page' } }
    );
    
    expect(document.title).toBe('First Page - User Lens');
    
    rerender({ title: 'Second Page' });
    
    expect(document.title).toBe('Second Page - User Lens');
  });

  it('should handle empty title', () => {
    renderHook(() => useDocumentTitle(''));
    
    expect(document.title).toBe('- User Lens');
  });

  it('should handle title with special characters', () => {
    const specialTitle = 'Page & Title: (Test) [Data]';
    renderHook(() => useDocumentTitle(specialTitle));
    
    expect(document.title).toBe(`${specialTitle} - User Lens`);
  });
});
