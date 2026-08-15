import { useQuery } from '@tanstack/react-query';
import { foliosAPI } from '@/lib/api/folios';

export function useOpenFolios(propertyId?: string) {
  return useQuery({
    queryKey: ['folios', propertyId, 'OPEN'],
    queryFn: () => foliosAPI.list({ propertyId, status: 'OPEN' }),
    enabled: Boolean(propertyId),
  });
}
