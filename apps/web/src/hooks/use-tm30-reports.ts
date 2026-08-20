import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tm30ReportsAPI, type Tm30Status } from '@/lib/api/tm30-reports';

export function useTm30Reports(params?: {
  propertyId?: string;
  status?: Tm30Status;
  overdue?: boolean;
}) {
  return useQuery({
    queryKey: [
      'tm30-reports',
      params?.propertyId,
      params?.status,
      params?.overdue,
    ],
    queryFn: () =>
      tm30ReportsAPI.list({
        propertyId: params?.propertyId ?? '',
        status: params?.status,
        overdue: params?.overdue,
      }),
    enabled: Boolean(params?.propertyId),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['tm30-reports'] });
}

export function useGenerateTm30Reports() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { propertyId: string; generatedBy: string }) =>
      tm30ReportsAPI.generate(data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useSubmitTm30Report() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, submittedBy }: { id: string; submittedBy: string }) =>
      tm30ReportsAPI.submit(id, submittedBy),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useConfirmTm30Report() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tm30ReportsAPI.confirm(id),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useFailTm30Report() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      failureReason,
    }: {
      id: string;
      failureReason: string;
    }) => tm30ReportsAPI.fail(id, failureReason),
    onSuccess: () => invalidate(queryClient),
  });
}
