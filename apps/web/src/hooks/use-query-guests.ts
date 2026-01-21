import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Guest } from '@/types';

export function useQueryGuests() {
  return useQuery({
    queryKey: ['guests'],
    queryFn: () => apiClient.get<Guest[]>('/guests'),
  });
}

export function useQueryGuest(id: string) {
  return useQuery({
    queryKey: ['guests', id],
    queryFn: () => apiClient.get<Guest>(`/guests/${id}`),
    enabled: !!id,
  });
}
