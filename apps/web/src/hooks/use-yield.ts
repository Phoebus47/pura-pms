import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { yieldAPI, type CreateCompetitorRateDto } from '@/lib/api/yield';

export function useYieldPace(propertyId?: string) {
  return useQuery({
    queryKey: ['yield-pace', propertyId],
    queryFn: () => yieldAPI.getPace(propertyId as string),
    enabled: Boolean(propertyId),
  });
}

export function useYieldRecommendations(propertyId?: string) {
  return useQuery({
    queryKey: ['yield-recommendations', propertyId],
    queryFn: () => yieldAPI.getRecommendations(propertyId as string, 'PENDING'),
    enabled: Boolean(propertyId),
  });
}

export function useYieldCompetitors(propertyId?: string) {
  return useQuery({
    queryKey: ['yield-competitors', propertyId],
    queryFn: () => yieldAPI.getCompetitors(propertyId as string),
    enabled: Boolean(propertyId),
  });
}

function invalidateYield(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['yield-pace'] });
  queryClient.invalidateQueries({ queryKey: ['yield-recommendations'] });
  queryClient.invalidateQueries({ queryKey: ['yield-competitors'] });
  queryClient.invalidateQueries({ queryKey: ['rates'] });
}

export function useGenerateYieldRecommendations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) =>
      yieldAPI.generateRecommendations(propertyId),
    onSuccess: () => invalidateYield(queryClient),
  });
}

export function useApplyYieldRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => yieldAPI.applyRecommendation(id),
    onSuccess: () => invalidateYield(queryClient),
  });
}

export function useDismissYieldRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => yieldAPI.dismissRecommendation(id),
    onSuccess: () => invalidateYield(queryClient),
  });
}

export function useCreateCompetitorRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompetitorRateDto) =>
      yieldAPI.createCompetitor(data),
    onSuccess: () => invalidateYield(queryClient),
  });
}
