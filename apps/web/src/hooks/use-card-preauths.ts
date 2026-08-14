import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cardPreauthsAPI,
  type CreateCardPreauthDto,
} from '@/lib/api/card-preauths';

export function useCardPreauths(reservationId?: string) {
  return useQuery({
    queryKey: ['card-preauths', reservationId],
    queryFn: () => cardPreauthsAPI.list(reservationId),
  });
}

export function useCreateCardPreauth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCardPreauthDto) => cardPreauthsAPI.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['card-preauths'] }),
  });
}

export function useIncrementCardPreauth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      cardPreauthsAPI.increment(id, amount),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['card-preauths'] }),
  });
}

export function useCaptureCardPreauth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      folioId,
      userId,
    }: {
      id: string;
      folioId: string;
      userId: string;
    }) => cardPreauthsAPI.capture(id, { folioId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-preauths'] });
      queryClient.invalidateQueries({ queryKey: ['folios'] });
    },
  });
}

export function useReleaseCardPreauth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cardPreauthsAPI.release(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['card-preauths'] }),
  });
}
