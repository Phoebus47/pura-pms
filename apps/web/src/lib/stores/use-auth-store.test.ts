import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './use-auth-store';

vi.mock('zustand/middleware', () => ({
  persist: <T>(fn: T) => fn,
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.clearAuth();
    });
  });

  it('should have initial null state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should set auth token and user', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    };

    act(() => {
      result.current.setAuth('test-token', mockUser);
    });

    expect(result.current.token).toBe('test-token');
    expect(result.current.user).toEqual(mockUser);
  });

  it('should clear auth token and user', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    };

    act(() => {
      result.current.setAuth('test-token', mockUser);
    });

    expect(result.current.token).toBe('test-token');

    act(() => {
      result.current.clearAuth();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
