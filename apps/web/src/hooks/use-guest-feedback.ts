import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  guestFeedbackAPI,
  type CreateGuestFeedbackDto,
} from '@/lib/api/guest-feedback';

export function useGuestFeedback(params?: { propertyId?: string }) {
  return useQuery({
    queryKey: ['guest-feedback', params?.propertyId],
    queryFn: () =>
      guestFeedbackAPI.list({ propertyId: params?.propertyId ?? '' }),
    enabled: Boolean(params?.propertyId),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['guest-feedback'] });
}

export function useCreateGuestFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGuestFeedbackDto) => guestFeedbackAPI.create(data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useReviewGuestFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; reviewedBy: string }) =>
      guestFeedbackAPI.review(params.id, { reviewedBy: params.reviewedBy }),
    onSuccess: () => invalidate(queryClient),
  });
}
