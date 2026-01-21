import { useState, useCallback } from 'react';
import { propertiesAPI, type Property } from '@/lib/api';
import { toast } from '@/lib/toast';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesAPI.getAll();
      setProperties(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load properties';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProperty = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await propertiesAPI.delete(id);
        toast.success('Property deleted successfully');
        await loadProperties();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete property';
        toast.error(errorMessage);
        return false;
      }
    },
    [loadProperties],
  );

  return {
    properties,
    loading,
    error,
    loadProperties,
    deleteProperty,
  };
}
