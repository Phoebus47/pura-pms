import { renderHook, act } from '@testing-library/react';
import { useUIStore } from './use-ui-store';

describe('useUIStore', () => {
  it('should have initial state', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.sidebarOpen).toBe(true);
    expect(result.current.theme).toBe('light');
    expect(result.current.tableDensity).toBe('default');
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

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme between light and dark', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setTheme('light');
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('should persist table density preference', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setTableDensity('compact');
    });

    expect(result.current.tableDensity).toBe('compact');

    act(() => {
      result.current.toggleTableDensity();
    });

    expect(result.current.tableDensity).toBe('default');
  });

  it('should set active property ID', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.activePropertyId).toBeUndefined();

    act(() => {
      result.current.setActivePropertyId('prop-123');
    });

    expect(result.current.activePropertyId).toBe('prop-123');

    act(() => {
      result.current.setActivePropertyId(undefined);
    });

    expect(result.current.activePropertyId).toBeUndefined();
  });
});
