import { useState, useCallback } from 'react';
import { roomsAPI, type Room, type RoomStatus } from '@/lib/api';
import { toast } from '@/lib/toast';

interface UseRoomsOptions {
  propertyId?: string;
  roomTypeId?: string;
  status?: RoomStatus;
}

export function useRooms(options?: UseRoomsOptions) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsAPI.getAll({
        propertyId: options?.propertyId,
        roomTypeId: options?.roomTypeId,
        status: options?.status,
      });
      setRooms(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load rooms';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options?.propertyId, options?.roomTypeId, options?.status]);

  return {
    rooms,
    loading,
    error,
    loadRooms,
  };
}
