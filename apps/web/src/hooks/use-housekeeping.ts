import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  housekeepingAPI,
  type InspectionLineInput,
} from '@/lib/api/housekeeping';

export function useHkBoard(propertyId?: string) {
  return useQuery({
    queryKey: ['housekeeping-board', propertyId],
    queryFn: () => housekeepingAPI.getBoard(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useHkChecklist() {
  return useQuery({
    queryKey: ['housekeeping-checklist'],
    queryFn: () => housekeepingAPI.getChecklist(),
  });
}

function invalidateBoard(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['housekeeping-board'] });
}

export function useMarkRoomClean() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => housekeepingAPI.markClean(roomId),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useInspectRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      inspectedBy,
      lines,
    }: {
      roomId: string;
      inspectedBy: string;
      lines: InspectionLineInput[];
    }) => housekeepingAPI.inspect(roomId, { inspectedBy, lines }),
    onSuccess: () => invalidateBoard(queryClient),
  });
}
