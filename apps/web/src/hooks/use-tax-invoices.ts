import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  taxInvoicesAPI,
  type IssueTaxInvoiceDto,
  type VoidTaxInvoiceDto,
} from '@/lib/api/tax-invoices';

export function useTaxInvoices(propertyId?: string, businessDate?: string) {
  return useQuery({
    queryKey: ['tax-invoices', propertyId, businessDate],
    queryFn: () => taxInvoicesAPI.list(propertyId as string, businessDate),
    enabled: Boolean(propertyId),
  });
}

export function useTaxInvoice(id?: string) {
  return useQuery({
    queryKey: ['tax-invoices', id],
    queryFn: () => taxInvoicesAPI.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useIssueTaxInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IssueTaxInvoiceDto) => taxInvoicesAPI.issue(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tax-invoices'] }),
  });
}

export function useVoidTaxInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidTaxInvoiceDto }) =>
      taxInvoicesAPI.void(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['tax-invoices'] }),
  });
}
