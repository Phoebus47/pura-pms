import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blocksAPI, type CreateBlockDto } from '@/lib/api/blocks';

export function useBlocks(propertyId?: string) {
  return useQuery({
    queryKey: ['blocks', propertyId],
    queryFn: () => blocksAPI.getAll(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useBlockPickup(blockId?: string) {
  return useQuery({
    queryKey: ['block-pickup', blockId],
    queryFn: () => blocksAPI.getPickup(blockId as string),
    enabled: Boolean(blockId),
  });
}

function invalidateBlocks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['blocks'] });
  queryClient.invalidateQueries({ queryKey: ['block-pickup'] });
}

export function useCreateBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlockDto) => blocksAPI.create(data),
    onSuccess: () => invalidateBlocks(queryClient),
  });
}

export function useAttachBlockReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reservationId,
    }: {
      id: string;
      reservationId: string;
    }) => blocksAPI.attach(id, reservationId),
    onSuccess: () => invalidateBlocks(queryClient),
  });
}

export function useReleaseBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blocksAPI.release(id),
    onSuccess: () => invalidateBlocks(queryClient),
  });
}
