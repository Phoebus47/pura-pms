import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  hardwareBridgeAPI,
  type CreateJobInput,
  type RegisterAgentInput,
} from '@/lib/api/hardware-bridge';

function invalidateHardware(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['hardware-agents'] });
  queryClient.invalidateQueries({ queryKey: ['hardware-jobs'] });
}

export function useHbAgents(propertyId?: string) {
  return useQuery({
    queryKey: ['hardware-agents', propertyId],
    queryFn: () => hardwareBridgeAPI.listAgents(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useHbJobs(propertyId?: string) {
  return useQuery({
    queryKey: ['hardware-jobs', propertyId],
    queryFn: () => hardwareBridgeAPI.listJobs(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useRegisterAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterAgentInput) =>
      hardwareBridgeAPI.registerAgent(data),
    onSuccess: () => invalidateHardware(queryClient),
  });
}

export function useHeartbeat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) => hardwareBridgeAPI.heartbeat(agentId),
    onSuccess: () => invalidateHardware(queryClient),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobInput) => hardwareBridgeAPI.createJob(data),
    onSuccess: () => invalidateHardware(queryClient),
  });
}

export function useSimulateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hardwareBridgeAPI.simulateJob(id),
    onSuccess: () => invalidateHardware(queryClient),
  });
}

export function useCompleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, result }: { id: string; result: unknown }) =>
      hardwareBridgeAPI.completeJob(id, result),
    onSuccess: () => invalidateHardware(queryClient),
  });
}
