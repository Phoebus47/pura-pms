import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  wakeUpCallsAPI,
  type CreateWakeUpCallDto,
} from '@/lib/api/wake-up-calls';

export function useWakeUpCalls(params?: {
  propertyId?: string;
  scheduledDate?: string;
  reservationId?: string;
}) {
  const enabled = Boolean(params?.propertyId || params?.reservationId);
  return useQuery({
    queryKey: [
      'wake-up-calls',
      params?.propertyId,
      params?.scheduledDate,
      params?.reservationId,
    ],
    queryFn: () => wakeUpCallsAPI.list(params ?? {}),
    enabled,
  });
}

export function useCreateWakeUpCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWakeUpCallDto) => wakeUpCallsAPI.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['wake-up-calls'] }),
  });
}

export function useCompleteWakeUpCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completedBy }: { id: string; completedBy: string }) =>
      wakeUpCallsAPI.complete(id, completedBy),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['wake-up-calls'] }),
  });
}

export function useMissWakeUpCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, missedBy }: { id: string; missedBy: string }) =>
      wakeUpCallsAPI.miss(id, missedBy),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['wake-up-calls'] }),
  });
}

export function useCancelWakeUpCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      cancelledBy,
      cancelReason,
    }: {
      id: string;
      cancelledBy: string;
      cancelReason?: string;
    }) => wakeUpCallsAPI.cancel(id, cancelledBy, cancelReason),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['wake-up-calls'] }),
  });
}
