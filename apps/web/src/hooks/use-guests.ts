import { useState, useCallback } from 'react';
import { guestsAPI, type Guest } from '@/lib/api';
import { toast } from '@/lib/toast';

interface UseGuestsOptions {
  search?: string;
  limit?: number;
}

export function useGuests(options?: UseGuestsOptions) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await guestsAPI.getAll({
        search: options?.search || undefined,
        limit: options?.limit || 50,
      });
      setGuests(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load guests';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options?.search, options?.limit]);

  const deleteGuest = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await guestsAPI.delete(id);
        toast.success('Guest deleted successfully');
        await loadGuests();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete guest';
        toast.error(errorMessage);
        return false;
      }
    },
    [loadGuests],
  );

  return {
    guests,
    loading,
    error,
    loadGuests,
    deleteGuest,
  };
}
