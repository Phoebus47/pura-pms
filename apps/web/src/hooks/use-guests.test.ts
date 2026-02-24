/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor, act } from '@testing-library/react';
import { useGuests } from './use-guests';
import { guestsAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api', () => ({
  guestsAPI: {
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

describe('useGuests', () => {
  const mockGuests = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+66123456789',
      nationality: 'US',
      idNumber: '',
      address: '',
      vipLevel: 0,
      isBlacklist: false,
      totalStays: 0,
      totalRevenue: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial loading state', () => {
    const { result } = renderHook(() => useGuests());

    expect(result.current.loading).toBe(true);
    expect(result.current.guests).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load guests when loadGuests is called', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: mockGuests });

    const { result } = renderHook(() => useGuests());

    await act(async () => {
      await result.current.loadGuests();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.guests).toEqual(mockGuests);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading error', async () => {
    const errorMessage = 'Failed to load guests';
    (guestsAPI.getAll as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useGuests());

    await act(async () => {
      await result.current.loadGuests();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle non-Error object during load', async () => {
    (guestsAPI.getAll as any).mockRejectedValue('String error');

    const { result } = renderHook(() => useGuests());

    await act(async () => {
      await result.current.loadGuests();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load guests');
    expect(toast.error).toHaveBeenCalledWith('Failed to load guests');
  });

  it('should apply search filter when provided', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: mockGuests });

    const { result } = renderHook(() => useGuests({ search: 'John' }));

    await act(async () => {
      await result.current.loadGuests();
    });

    expect(guestsAPI.getAll).toHaveBeenCalledWith({
      search: 'John',
      limit: 50,
    });
  });

  it('should apply limit when provided', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: mockGuests });

    const { result } = renderHook(() => useGuests({ limit: 10 }));

    await act(async () => {
      await result.current.loadGuests();
    });

    expect(guestsAPI.getAll).toHaveBeenCalledWith({
      search: undefined,
      limit: 10,
    });
  });

  it('should delete guest successfully', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: mockGuests });
    (guestsAPI.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useGuests());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteGuest('1');
    });

    expect(deleteResult!).toBe(true);
    expect(guestsAPI.delete).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith('Guest deleted successfully');
    expect(guestsAPI.getAll).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    const errorMessage = 'Failed to delete guest';
    (guestsAPI.delete as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useGuests());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteGuest('1');
    });

    expect(deleteResult!).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle non-Error object during delete', async () => {
    (guestsAPI.delete as any).mockRejectedValue('String error');

    const { result } = renderHook(() => useGuests());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteGuest('1');
    });

    expect(deleteResult!).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to delete guest');
  });

  it('should reload guests after successful delete', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: mockGuests });
    (guestsAPI.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useGuests());

    await act(async () => {
      await result.current.deleteGuest('1');
    });

    expect(guestsAPI.getAll).toHaveBeenCalled();
  });
});
