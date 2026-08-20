import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  guestMessagesAPI,
  type CreateGuestMessageDto,
} from '@/lib/api/guest-messages';

export function useGuestMessages(params?: { propertyId?: string }) {
  return useQuery({
    queryKey: ['guest-messages', params?.propertyId],
    queryFn: () =>
      guestMessagesAPI.list({ propertyId: params?.propertyId ?? '' }),
    enabled: Boolean(params?.propertyId),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['guest-messages'] });
}

export function useCreateGuestMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGuestMessageDto) => guestMessagesAPI.create(data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useMarkGuestMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestMessagesAPI.markRead(id),
    onSuccess: () => invalidate(queryClient),
  });
}
