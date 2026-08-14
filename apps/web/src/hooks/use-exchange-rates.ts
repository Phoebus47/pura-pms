import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  exchangeRatesAPI,
  type CreateExchangeRateDto,
  type UpdateExchangeRateDto,
} from '@/lib/api/exchange-rates';

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => exchangeRatesAPI.list(),
  });
}

export function useCreateExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExchangeRateDto) => exchangeRatesAPI.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] }),
  });
}

export function useUpdateExchangeRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExchangeRateDto }) =>
      exchangeRatesAPI.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] }),
  });
}
