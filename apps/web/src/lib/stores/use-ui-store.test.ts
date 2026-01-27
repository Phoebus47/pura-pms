import { renderHook, act } from '@testing-library/react';
import { useUIStore } from './use-ui-store';

describe('useUIStore', () => {
  it('should have initial state', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.sidebarOpen).toBe(true);
    expect(result.current.theme).toBe('light');
  });

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.sidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(true);
  });

  it('should set sidebar open state', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setSidebarOpen(false);
    });

    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.setSidebarOpen(true);
    });

    expect(result.current.sidebarOpen).toBe(true);
  });

  it('should set theme', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });
});
