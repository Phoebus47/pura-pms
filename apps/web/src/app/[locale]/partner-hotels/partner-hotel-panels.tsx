'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreatePartnerHotel,
  useUpdatePartnerHotel,
} from '@/hooks/use-partner-hotels';
import type { PartnerHotel } from '@/lib/api/partner-hotels';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';

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
          className={fieldClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="partnerHotelPhone">{t('partnerHotels.phone')}</Label>
        <Input
          id="partnerHotelPhone"
          name="phone"
          className={fieldClass}
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
          className={fieldClass}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
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
    return <p className="text-slate-600 text-sm">{t('partnerHotels.empty')}</p>;
  }

  return (
    <ul className="space-y-2">
      {hotels.map((hotel) => (
        <li
          key={hotel.id}
          className="border flex gap-3 items-center justify-between p-3 rounded-md text-sm"
        >
          <div>
            <p className="font-medium">{hotel.name}</p>
            {hotel.phone ? (
              <p className="text-slate-500">{hotel.phone}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
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
