import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  shiftsAPI,
  type ApproveShiftDto,
  type CloseShiftDto,
  type HandoverShiftDto,
  type OpenShiftDto,
} from '@/lib/api/shifts';

function invalidateShifts(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['shifts'] }),
    queryClient.invalidateQueries({ queryKey: ['shifts', 'current'] }),
  ]);
}

export function useTodayShifts(propertyId?: string, businessDate?: string) {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: () => shiftsAPI.list(propertyId as string, businessDate as string),
    enabled: Boolean(propertyId && businessDate),
  });
}

export function useCurrentShift(propertyId?: string, userId?: string) {
  return useQuery({
    queryKey: ['shifts', 'current', propertyId, userId],
    queryFn: () => shiftsAPI.getCurrent(propertyId as string, userId as string),
    enabled: Boolean(propertyId && userId),
  });
}

export function useShift(id?: string) {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: () => shiftsAPI.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useOpenShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OpenShiftDto) => shiftsAPI.open(data),
    onSuccess: () => invalidateShifts(queryClient),
  });
}

export function useCloseShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloseShiftDto }) =>
      shiftsAPI.close(id, data),
    onSuccess: () => invalidateShifts(queryClient),
  });
}

export function useApproveShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveShiftDto }) =>
      shiftsAPI.approve(id, data),
    onSuccess: () => invalidateShifts(queryClient),
  });
}

export function useHandoverShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HandoverShiftDto }) =>
      shiftsAPI.handover(id, data),
    onSuccess: () => invalidateShifts(queryClient),
  });
}
