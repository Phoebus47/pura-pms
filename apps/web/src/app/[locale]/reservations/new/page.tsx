'use client';

import { useState } from 'react';
import { Calendar, Check, CreditCard, User } from 'lucide-react';
import { type Guest } from '@/lib/api';
import { GuestSearchDialog } from '@/components/guest-search-dialog';
import { GuestFormDialog } from '@/components/guest-form-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { t } from '@/lib/i18n';
import { ReservationProgress } from './reservation-progress';
import { StepDatesProperty } from './step-dates-property';
import { StepRoomSelect } from './step-room-select';
import { StepGuestSelect } from './step-guest-select';
import { StepConfirm } from './step-confirm';
import { useNewReservationForm } from './use-new-reservation-form';

export default function NewReservationPage() {
  const form = useNewReservationForm();
  const [isGuestSearchOpen, setIsGuestSearchOpen] = useState(false);
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);

  const steps = [
    {
      number: 1,
      title: t('reservations.new.steps.datesProperty'),
      icon: Calendar,
    },
    {
      number: 2,
      title: t('reservations.new.steps.selectRoom'),
      icon: CreditCard,
    },
    { number: 3, title: t('reservations.new.steps.guestInfo'), icon: User },
    { number: 4, title: t('reservations.new.steps.confirm'), icon: Check },
  ];

  function handleGuestCreated(guest: Guest) {
    form.setSelectedGuest(guest);
    setIsGuestFormOpen(false);
  }

  const { pricing, selectedRoom, secondRoom, selectedGuest } = form;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('reservations.new.title')}
        subtitle={t('reservations.new.subtitle')}
      />

      <ReservationProgress steps={steps} currentStep={form.currentStep} />

      {form.currentStep === 1 && (
        <StepDatesProperty
          {...form.dateFields}
          stayPurposeFields={form.stayPurposeFields}
          taxExemptFields={form.taxExemptFields}
          roomLockFields={form.roomLockFields}
          splitStayOptions={form.splitStayOptions}
          loadingRooms={form.loadingRooms}
          onNext={form.handleStep1Next}
        />
      )}

      {form.currentStep === 2 && (
        <StepRoomSelect
          availableRooms={form.availableRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={form.setSelectedRoom}
          isSplitStay={pricing.isSplitStay}
          secondRoom={secondRoom}
          onSelectSecondRoom={form.setSecondRoom}
          onBack={() => form.goToStep(1)}
          onNext={form.handleStep2Next}
        />
      )}

      {form.currentStep === 3 && (
        <StepGuestSelect
          selectedGuest={selectedGuest}
          onClearGuest={() => form.setSelectedGuest(null)}
          onOpenSearch={() => setIsGuestSearchOpen(true)}
          onOpenCreate={() => setIsGuestFormOpen(true)}
          onBack={() => form.goToStep(2)}
          onNext={form.handleStep3Next}
        />
      )}

      {form.currentStep === 4 && (
        <StepConfirm
          summary={{
            checkIn: pricing.checkIn,
            checkOut: pricing.checkOut,
            nights: pricing.nights,
            isDayUse: pricing.isDayUse,
            isSplitStay: pricing.isSplitStay,
            selectedRoom,
            selectedGuest,
            stayPurpose: pricing.stayPurpose,
            taxExempt: pricing.taxExempt,
            isRoomLocked: pricing.isRoomLocked,
          }}
          total={{
            totalAmount: pricing.totalAmount,
            baseRate: pricing.firstRate,
            isDayUse: pricing.isDayUse,
            nights: pricing.nights,
            secondSegment:
              pricing.isSplitStay && secondRoom
                ? { rate: pricing.secondRate, nights: pricing.splitTailNights }
                : undefined,
          }}
          stayPurposeFields={form.stayPurposeFields}
          taxExemptFields={form.taxExemptFields}
          roomLockFields={form.roomLockFields}
          numberOfGuests={form.numberOfGuests}
          onNumberOfGuestsChange={form.setNumberOfGuests}
          maxOccupancy={selectedRoom?.roomType?.maxOccupancy || 4}
          specialRequests={form.specialRequests}
          onSpecialRequestsChange={form.setSpecialRequests}
          submitting={form.submitting}
          onBack={() => form.goToStep(3)}
          onSubmit={form.handleSubmit}
        />
      )}

      <GuestSearchDialog
        isOpen={isGuestSearchOpen}
        onClose={() => setIsGuestSearchOpen(false)}
        onSelectGuest={form.setSelectedGuest}
        onCreateNew={() => {
          setIsGuestSearchOpen(false);
          setIsGuestFormOpen(true);
        }}
      />

      <GuestFormDialog
        isOpen={isGuestFormOpen}
        onClose={() => setIsGuestFormOpen(false)}
        onSuccess={handleGuestCreated}
      />
    </div>
  );
}
