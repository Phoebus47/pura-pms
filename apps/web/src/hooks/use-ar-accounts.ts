import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  arAccountsAPI,
  arInvoicesAPI,
  type AllocatePaymentDto,
  type CreateArAccountDto,
  type TransferFolioDto,
} from '@/lib/api/ar-accounts';

export function useArAccounts(propertyId?: string) {
  return useQuery({
    queryKey: ['ar-accounts', propertyId],
    queryFn: () => arAccountsAPI.list(propertyId as string),
    enabled: Boolean(propertyId),
  });
}

export function useArAccount(id?: string) {
  return useQuery({
    queryKey: ['ar-accounts', id],
    queryFn: () => arAccountsAPI.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useArAging(id?: string) {
  return useQuery({
    queryKey: ['ar-aging', id],
    queryFn: () => arAccountsAPI.aging(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateArAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateArAccountDto) => arAccountsAPI.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['ar-accounts'] }),
  });
}

export function useTransferToCityLedger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransferFolioDto }) =>
      arAccountsAPI.transfer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['ar-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['folios'] });
    },
  });
}

export function useArInvoices(propertyId?: string, arAccountId?: string) {
  return useQuery({
    queryKey: ['ar-invoices', propertyId, arAccountId],
    queryFn: () => arInvoicesAPI.list(propertyId as string, arAccountId),
    enabled: Boolean(propertyId),
  });
}

export function useAllocateArPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AllocatePaymentDto }) =>
      arInvoicesAPI.allocate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['ar-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['ar-aging'] });
    },
  });
}
