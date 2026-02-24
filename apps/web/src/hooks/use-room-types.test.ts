/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRoomTypes } from './use-room-types';
import { roomTypesAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api', () => ({
  roomTypesAPI: {
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

describe('useRoomTypes', () => {
  const mockRoomTypes = [
    {
      id: '1',
      name: 'Standard',
      code: 'STD',
      baseRate: 1000,
      maxAdults: 2,
      maxChildren: 0,
      maxOccupancy: 2,
      amenities: ['WiFi', 'TV'],
      propertyId: 'prop1',
    },
    {
      id: '2',
      name: 'Deluxe',
      code: 'DLX',
      baseRate: 2000,
      maxAdults: 3,
      maxChildren: 1,
      maxOccupancy: 4,
      amenities: ['WiFi', 'TV', 'Mini Bar'],
      propertyId: 'prop1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have initial loading state', () => {
    const { result } = renderHook(() => useRoomTypes());

    expect(result.current.loading).toBe(true);
    expect(result.current.roomTypes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load room types when loadRoomTypes is called', async () => {
    (roomTypesAPI.getAll as any).mockResolvedValue(mockRoomTypes);

    const { result } = renderHook(() => useRoomTypes());

    await act(async () => {
      await result.current.loadRoomTypes();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roomTypes).toEqual(mockRoomTypes);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading error', async () => {
    const errorMessage = 'Failed to load room types';
    (roomTypesAPI.getAll as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRoomTypes());

    await act(async () => {
      await result.current.loadRoomTypes();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle non-Error object during load', async () => {
    (roomTypesAPI.getAll as any).mockRejectedValue('String error');

    const { result } = renderHook(() => useRoomTypes());

    await act(async () => {
      await result.current.loadRoomTypes();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load room types');
    expect(toast.error).toHaveBeenCalledWith('Failed to load room types');
  });

  it('should delete room type successfully', async () => {
    (roomTypesAPI.getAll as any).mockResolvedValue(mockRoomTypes);
    (roomTypesAPI.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRoomTypes());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteRoomType('1');
    });

    expect(deleteResult!).toBe(true);
    expect(roomTypesAPI.delete).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith(
      'Room type deleted successfully',
    );
    expect(roomTypesAPI.getAll).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    const errorMessage = 'Failed to delete room type';
    (roomTypesAPI.delete as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRoomTypes());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteRoomType('1');
    });

    expect(deleteResult!).toBe(false);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle non-Error object during delete', async () => {
    (roomTypesAPI.delete as any).mockRejectedValue('String error');

    const { result } = renderHook(() => useRoomTypes());

    let deleteResult: boolean;
    await act(async () => {
      deleteResult = await result.current.deleteRoomType('1');
    });

    expect(deleteResult!).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Failed to delete room type');
  });

  it('should reload room types after successful delete', async () => {
    (roomTypesAPI.getAll as any).mockResolvedValue(mockRoomTypes);
    (roomTypesAPI.delete as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRoomTypes());

    await act(async () => {
      await result.current.deleteRoomType('1');
    });

    expect(roomTypesAPI.getAll).toHaveBeenCalled();
  });
});
