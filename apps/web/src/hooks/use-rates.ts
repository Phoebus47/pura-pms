import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ratesAPI,
  type CreateRateDto,
  type UpdateRateDto,
} from '@/lib/api/rates';

export function useRates(propertyId?: string) {
  return useQuery({
    queryKey: ['rates', propertyId],
    queryFn: () => ratesAPI.getAll(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useCreateRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRateDto) => ratesAPI.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rates'] }),
  });
}

export function useUpdateRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRateDto }) =>
      ratesAPI.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rates'] }),
  });
}
