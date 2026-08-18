import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registrationCardsAPI,
  type CreateRegCardPrintJobDto,
  type CreateRegistrationCardDto,
  type SignRegistrationCardDto,
  type VoidRegistrationCardDto,
} from '@/lib/api/registration-cards';

export function useRegistrationCards(reservationId?: string) {
  return useQuery({
    queryKey: ['registration-cards', reservationId],
    queryFn: () =>
      registrationCardsAPI.listByReservation(reservationId as string),
    enabled: Boolean(reservationId),
  });
}

export function useRegistrationCard(id?: string) {
  return useQuery({
    queryKey: ['registration-cards', 'detail', id],
    queryFn: () => registrationCardsAPI.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateRegistrationCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRegistrationCardDto) =>
      registrationCardsAPI.createDraft(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['registration-cards'] }),
  });
}

export function useSignRegistrationCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignRegistrationCardDto }) =>
      registrationCardsAPI.sign(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['registration-cards'] }),
  });
}

export function useVoidRegistrationCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidRegistrationCardDto }) =>
      registrationCardsAPI.void(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['registration-cards'] }),
  });
}

export function useRegCardPrintJob() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateRegCardPrintJobDto;
    }) => registrationCardsAPI.createPrintJob(id, data),
  });
}
