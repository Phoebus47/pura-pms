import { renderHook, waitFor, act } from '@testing-library/react';
import { useRooms } from './use-rooms';
import { roomsAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

jest.mock('@/lib/api', () => ({
  roomsAPI: {
    getAll: jest.fn(),
  },
}));

jest.mock('@/lib/toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('useRooms', () => {
  const mockRooms = [
    {
      id: '1',
      number: '101',
      floor: 1,
      status: 'VACANT_CLEAN',
      roomTypeId: 'type1',
      propertyId: 'prop1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      number: '102',
      floor: 1,
      status: 'OCCUPIED_CLEAN',
      roomTypeId: 'type1',
      propertyId: 'prop1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have initial loading state', () => {
    const { result } = renderHook(() => useRooms());

    expect(result.current.loading).toBe(true);
    expect(result.current.rooms).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load rooms when loadRooms is called', async () => {
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    const { result } = renderHook(() => useRooms());

    await act(async () => {
      await result.current.loadRooms();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rooms).toEqual(mockRooms);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading error', async () => {
    const errorMessage = 'Failed to load rooms';
    (roomsAPI.getAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRooms());

    await act(async () => {
      await result.current.loadRooms();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.error).toBe(errorMessage);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should handle non-Error rejection', async () => {
    const errorMessage = 'Failed to load rooms';
    (roomsAPI.getAll as jest.Mock).mockRejectedValue(errorMessage);

    const { result } = renderHook(() => useRooms());

    await act(async () => {
      await result.current.loadRooms();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should apply propertyId filter when provided', async () => {
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    const { result } = renderHook(() => useRooms({ propertyId: 'prop1' }));

    await act(async () => {
      await result.current.loadRooms();
    });

    expect(roomsAPI.getAll).toHaveBeenCalledWith({
      propertyId: 'prop1',
      roomTypeId: undefined,
      status: undefined,
    });
  });

  it('should apply roomTypeId filter when provided', async () => {
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    const { result } = renderHook(() => useRooms({ roomTypeId: 'type1' }));

    await act(async () => {
      await result.current.loadRooms();
    });

    expect(roomsAPI.getAll).toHaveBeenCalledWith({
      propertyId: undefined,
      roomTypeId: 'type1',
      status: undefined,
    });
  });

  it('should apply status filter when provided', async () => {
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    const { result } = renderHook(() => useRooms({ status: 'VACANT_CLEAN' }));

    await act(async () => {
      await result.current.loadRooms();
    });

    expect(roomsAPI.getAll).toHaveBeenCalledWith({
      propertyId: undefined,
      roomTypeId: undefined,
      status: 'VACANT_CLEAN',
    });
  });

  it('should apply all filters when provided', async () => {
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    const { result } = renderHook(() =>
      useRooms({
        propertyId: 'prop1',
        roomTypeId: 'type1',
        status: 'VACANT_CLEAN',
      }),
    );

    await act(async () => {
      await result.current.loadRooms();
    });

    expect(roomsAPI.getAll).toHaveBeenCalledWith({
      propertyId: 'prop1',
      roomTypeId: 'type1',
      status: 'VACANT_CLEAN',
    });
  });
});
