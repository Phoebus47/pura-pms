/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProperties } from './use-properties';
import { propertiesAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useProperties', () => {
  const mockProperties = [
    {
      id: '1',
      name: 'Property A',
      address: '123 Main St',
      phone: '+66123456789',
      email: 'property@example.com',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Property B',
      address: '456 Oak Ave',
      phone: '+66987654321',
      email: 'property2@example.com',
      currency: 'THB',
      timezone: 'Asia/Bangkok',
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial loading state', () => {
    const { result } = renderHook(() => useProperties());

    expect(result.current.loading).toBe(true);
    expect(result.current.properties).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load properties when loadProperties is called', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);

    const { result } = renderHook(() => useProperties());

    await act(async () => {
      await result.current.loadProperties();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.properties).toEqual(mockProperties);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading error', async () => {
    const errorMessage = 'Failed to load properties';
    (propertiesAPI.getAll as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProperties());

    await act(async () => {
      await result.current.loadProperties();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should delete property successfully', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);
    (propertiesAPI.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProperties());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteProperty('1');
    });

    expect(deleteResult!).toBe(true);
    expect(propertiesAPI.delete).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith('Property deleted successfully');
    expect(propertiesAPI.getAll).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    const errorMessage = 'Failed to delete property';
    (propertiesAPI.delete as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProperties());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteProperty('1');
    });

    expect(deleteResult!).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should reload properties after successful delete', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue(mockProperties);
    (propertiesAPI.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProperties());

    await act(async () => {
      await result.current.deleteProperty('1');
    });

    expect(propertiesAPI.getAll).toHaveBeenCalled();
  });

  it('handles non-Error objects during load', async () => {
    (propertiesAPI.getAll as any).mockRejectedValue('String error');

    const { result } = renderHook(() => useProperties());

    await act(async () => {
      await result.current.loadProperties();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load properties');
    expect(toast.error).toHaveBeenCalledWith('Failed to load properties');
  });

  it('handles non-Error objects during delete', async () => {
    (propertiesAPI.getAll as any).mockResolvedValue([]);
    const { result } = renderHook(() => useProperties());
    (propertiesAPI.delete as any).mockRejectedValue(123);

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteProperty('1');
    });

    expect(deleteResult).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to delete property');
  });
});
