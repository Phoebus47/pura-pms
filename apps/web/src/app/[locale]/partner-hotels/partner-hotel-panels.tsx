'use client';

import { useState } from 'react';
import { Hotel } from 'lucide-react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  useCreatePartnerHotel,
  useUpdatePartnerHotel,
} from '@/hooks/use-partner-hotels';
import type { PartnerHotel } from '@/lib/api/partner-hotels';

const buttonClass = 'w-full sm:w-auto';

interface CreateFormProps {
  readonly propertyId: string;
}

export function CreatePartnerHotelForm({ propertyId }: CreateFormProps) {
  const createMutation = useCreatePartnerHotel();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  async function handleSubmit() {
    try {
      await createMutation.mutateAsync({
        propertyId,
        name,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      toast.success(t('partnerHotels.createSuccess'));
      setName('');
      setPhone('');
      setAddress('');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('partnerHotels.createSubmit'),
      );
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="partnerHotelName">{t('partnerHotels.name')}</Label>
        <Input
          id="partnerHotelName"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="gap-4 grid sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="partnerHotelPhone">{t('partnerHotels.phone')}</Label>
          <Input
            id="partnerHotelPhone"
            name="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partnerHotelAddress">
            {t('partnerHotels.address')}
          </Label>
          <Input
            id="partnerHotelAddress"
            name="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={createMutation.isPending}
        className={buttonClass}
      >
        {t('partnerHotels.createSubmit')}
      </Button>
    </form>
  );
}

interface ListProps {
  readonly hotels: PartnerHotel[];
}

export function PartnerHotelList({ hotels }: ListProps) {
  const updateMutation = useUpdatePartnerHotel();

  async function toggleActive(hotel: PartnerHotel) {
    try {
      await updateMutation.mutateAsync({
        id: hotel.id,
        data: { isActive: !hotel.isActive },
      });
      toast.success(
        hotel.isActive
          ? t('partnerHotels.deactivated')
          : t('partnerHotels.activated'),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('partnerHotels.updateFailed'),
      );
    }
  }

  if (hotels.length === 0) {
    return (
      <EmptyState
        icon={<Hotel className="h-10 w-10" />}
        title={t('partnerHotels.empty')}
      />
    );
  }

  return (
    <ul className="space-y-2">
      {hotels.map((hotel) => (
        <li
          key={hotel.id}
          className="border border-rule-mist flex gap-3 items-center justify-between p-4 rounded-lg text-sm"
        >
          <div className="min-w-0">
            <p className="flex flex-wrap font-semibold gap-2 items-center text-ink-strong">
              {hotel.name}
              <StatusBadge
                tone={hotel.isActive ? 'positive' : 'neutral'}
                label={
                  hotel.isActive
                    ? t('partnerHotels.statusActive')
                    : t('partnerHotels.statusInactive')
                }
                size="sm"
              />
            </p>
            {hotel.phone ? (
              <p className="text-ink-subtle">{hotel.phone}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={() => void toggleActive(hotel)}
          >
            {hotel.isActive
              ? t('partnerHotels.deactivate')
              : t('partnerHotels.activate')}
          </Button>
        </li>
      ))}
    </ul>
  );
}
