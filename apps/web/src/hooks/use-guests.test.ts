import { renderHook, waitFor, act } from '@testing-library/react';
import { useGuests } from './use-guests';
import { guestsAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

jest.mock('@/lib/api', () => ({
  guestsAPI: {
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should have initial loading state', () => {
    const { result } = renderHook(() => useGuests());

    expect(result.current.loading).toBe(true);
    expect(result.current.guests).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load guests when loadGuests is called', async () => {
    (guestsAPI.getAll as jest.Mock).mockResolvedValue({ data: mockGuests });

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
    (guestsAPI.getAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

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

  it('should apply search filter when provided', async () => {
    (guestsAPI.getAll as jest.Mock).mockResolvedValue({ data: mockGuests });

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
    (guestsAPI.getAll as jest.Mock).mockResolvedValue({ data: mockGuests });

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
    (guestsAPI.getAll as jest.Mock).mockResolvedValue({ data: mockGuests });
    (guestsAPI.delete as jest.Mock).mockResolvedValue(undefined);

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
    (guestsAPI.delete as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useGuests());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteGuest('1');
    });

    expect(deleteResult!).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should reload guests after successful delete', async () => {
    (guestsAPI.getAll as jest.Mock).mockResolvedValue({ data: mockGuests });
    (guestsAPI.delete as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useGuests());

    await act(async () => {
      await result.current.deleteGuest('1');
    });

    expect(guestsAPI.getAll).toHaveBeenCalled();
  });
});
