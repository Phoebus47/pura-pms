import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  digitalKeysAPI,
  type IssueDigitalKeyDto,
  type RevokeDigitalKeyDto,
} from '@/lib/api/digital-keys';

export function useDigitalKeys(params?: {
  propertyId?: string;
  reservationId?: string;
}) {
  const enabled = Boolean(params?.propertyId || params?.reservationId);
  return useQuery({
    queryKey: ['digital-keys', params?.propertyId, params?.reservationId],
    queryFn: () => digitalKeysAPI.list(params ?? {}),
    enabled,
  });
}

export function useIssueDigitalKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IssueDigitalKeyDto) => digitalKeysAPI.issue(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['digital-keys'] }),
  });
}

export function useRevokeDigitalKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RevokeDigitalKeyDto }) =>
      digitalKeysAPI.revoke(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['digital-keys'] }),
  });
}
