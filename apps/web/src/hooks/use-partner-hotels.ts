import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  partnerHotelsAPI,
  type CreatePartnerHotelDto,
  type UpdatePartnerHotelDto,
} from '@/lib/api/partner-hotels';

export function usePartnerHotels(propertyId?: string) {
  return useQuery({
    queryKey: ['partner-hotels', propertyId],
    queryFn: () => partnerHotelsAPI.getAll(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useCreatePartnerHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePartnerHotelDto) => partnerHotelsAPI.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['partner-hotels'] }),
  });
}

export function useUpdatePartnerHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerHotelDto }) =>
      partnerHotelsAPI.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['partner-hotels'] }),
  });
}
