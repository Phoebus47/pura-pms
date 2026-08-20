import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  lostFoundAPI,
  type CreateLostFoundItemDto,
  type LostFoundStatus,
} from '@/lib/api/lost-found';

export function useLostFoundItems(params?: {
  propertyId?: string;
  status?: LostFoundStatus;
}) {
  return useQuery({
    queryKey: ['lost-found', params?.propertyId, params?.status],
    queryFn: () =>
      lostFoundAPI.list({
        propertyId: params?.propertyId ?? '',
        status: params?.status,
      }),
    enabled: Boolean(params?.propertyId),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['lost-found'] });
}

export function useCreateLostFoundItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLostFoundItemDto) => lostFoundAPI.create(data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useClaimLostFoundItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, claimedBy }: { id: string; claimedBy: string }) =>
      lostFoundAPI.claim(id, claimedBy),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useReturnLostFoundItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, returnedTo }: { id: string; returnedTo: string }) =>
      lostFoundAPI.returnItem(id, returnedTo),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDisposeLostFoundItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      disposedBy,
      disposeReason,
    }: {
      id: string;
      disposedBy: string;
      disposeReason: string;
    }) => lostFoundAPI.dispose(id, disposedBy, disposeReason),
    onSuccess: () => invalidate(queryClient),
  });
}
