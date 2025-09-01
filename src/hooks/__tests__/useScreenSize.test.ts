import { renderHook } from '@testing-library/react';
import { useScreenSize } from '../useScreenSize';

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mock addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
window.addEventListener = mockAddEventListener;
window.removeEventListener = mockRemoveEventListener;

describe('useScreenSize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.innerWidth = 1024; // Reset to desktop size
  });

  it('should return false for desktop screen sizes', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useScreenSize());
    
    expect(result.current.isMobile).toBe(false);
  });

  it('should return true for mobile screen sizes', () => {
    window.innerWidth = 500;
    const { result } = renderHook(() => useScreenSize());
    
    expect(result.current.isMobile).toBe(true);
  });

  it('should use custom breakpoint', () => {
    window.innerWidth = 800;
    const { result } = renderHook(() => useScreenSize(900));
    
    expect(result.current.isMobile).toBe(true);
  });

  it('should use custom breakpoint - desktop case', () => {
    window.innerWidth = 1000;
    const { result } = renderHook(() => useScreenSize(900));
    
    expect(result.current.isMobile).toBe(false);
  });

  it('should add resize event listener on mount', () => {
    renderHook(() => useScreenSize());
    
    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should remove resize event listener on unmount', () => {
    const { unmount } = renderHook(() => useScreenSize());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should use default breakpoint of 768', () => {
    window.innerWidth = 767;
    const { result: mobileResult } = renderHook(() => useScreenSize());
    expect(mobileResult.current.isMobile).toBe(true);

    window.innerWidth = 769;
    const { result: desktopResult } = renderHook(() => useScreenSize());
    expect(desktopResult.current.isMobile).toBe(false);
  });
});
