import { useState, useCallback } from 'react';
import { roomTypesAPI, type RoomType } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoomTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomTypesAPI.getAll();
      setRoomTypes(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('roomTypes.loadFailed');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRoomType = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await roomTypesAPI.delete(id);
        toast.success(t('roomTypes.deleted'));
        await loadRoomTypes();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t('roomTypes.deleteFailed');
        toast.error(errorMessage);
        return false;
      }
    },
    [loadRoomTypes],
  );

  return {
    roomTypes,
    loading,
    error,
    loadRoomTypes,
    deleteRoomType,
  };
}
