import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  guestComplaintsAPI,
  type CreateGuestComplaintDto,
  type ResolveGuestComplaintDto,
} from '@/lib/api/guest-complaints';

export function useGuestComplaints(params?: { propertyId?: string }) {
  return useQuery({
    queryKey: ['guest-complaints', params?.propertyId],
    queryFn: () =>
      guestComplaintsAPI.list({ propertyId: params?.propertyId ?? '' }),
    enabled: Boolean(params?.propertyId),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['guest-complaints'] });
}

export function useCreateGuestComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGuestComplaintDto) =>
      guestComplaintsAPI.create(data),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useStartGuestComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; assignedTo?: string }) =>
      guestComplaintsAPI.start(params.id, {
        assignedTo: params.assignedTo,
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useResolveGuestComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string } & ResolveGuestComplaintDto) =>
      guestComplaintsAPI.resolve(params.id, {
        resolvedBy: params.resolvedBy,
        resolutionNote: params.resolutionNote,
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useCloseGuestComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; closedBy: string }) =>
      guestComplaintsAPI.close(params.id, { closedBy: params.closedBy }),
    onSuccess: () => invalidate(queryClient),
  });
}
