'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  reservationsAPI,
  roomsAPI,
  type CreateReservationDto,
  type Guest,
  type Room,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import { t } from '@/lib/i18n';
import { buildSplitStayPayload, calendarNights } from '@/lib/split-stay';
import { isNonRevenueStay } from '@/lib/stay-purpose';
import {
  calculateExtendedStayTotal,
  isExtendedBillingCycle,
} from '@/lib/billing-cycle';
import { useStayOptions } from './use-stay-options';

export type Step = 1 | 2 | 3 | 4;

export function useNewReservationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [propertyId, setPropertyId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [secondRoom, setSecondRoom] = useState<Room | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stay = useStayOptions({
    checkIn,
    checkOut,
    setCheckOut,
    clearSecondRoom: () => setSecondRoom(null),
  });
  const {
    isDayUse,
    stayPurpose,
    approvedBy,
    stayPurposeNote,
    department,
    billingCycle,
    taxExempt,
    taxExemptReason,
    taxExemptDocumentRef,
    taxExemptApprovedBy,
    isRoomLocked,
    roomLockNote,
    isSplitStay,
    splitDate,
  } = stay.values;

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;
  const billedNights = isDayUse ? 1 : nights;
  const firstRate = Number(selectedRoom?.roomType?.baseRate || 0);
  const secondRate = Number(secondRoom?.roomType?.baseRate || 0);
  const rackTotal = isSplitStay
    ? calendarNights(checkIn, splitDate) * firstRate +
      calendarNights(splitDate, checkOut) * secondRate
    : isExtendedBillingCycle(billingCycle)
      ? calculateExtendedStayTotal(billedNights, firstRate, billingCycle)
      : firstRate * billedNights;
  const totalAmount = isNonRevenueStay(stayPurpose) ? 0 : rackTotal;

  async function handleStep1Next() {
    if (!propertyId || !checkIn || !checkOut) {
      toast.warning(t('reservations.new.selectPropertyAndDates'));
      return;
    }

    setLoadingRooms(true);
    try {
      const rooms = await roomsAPI.getAll({
        propertyId,
        status: 'VACANT_CLEAN',
      });
      setAvailableRooms(rooms);
      setCurrentStep(2);
    } catch {
      toast.error(t('reservations.new.loadRoomsFailed'));
    } finally {
      setLoadingRooms(false);
    }
  }

  function handleStep2Next() {
    if (!selectedRoom) {
      toast.warning(t('reservations.new.selectRoomFirst'));
      return;
    }
    if (isSplitStay) {
      if (!splitDate || splitDate <= checkIn || splitDate >= checkOut) {
        toast.warning(t('reservations.splitStay.invalidDates'));
        return;
      }
      if (
        !secondRoom ||
        secondRoom.id === selectedRoom.id ||
        (secondRoom.roomType?.id || secondRoom.roomTypeId) ===
          (selectedRoom.roomType?.id || selectedRoom.roomTypeId)
      ) {
        toast.warning(t('reservations.splitStay.needSecondRoom'));
        return;
      }
    }
    setCurrentStep(3);
  }

  function handleStep3Next() {
    if (!selectedGuest) {
      toast.warning(t('reservations.new.selectGuestFirst'));
      return;
    }
    setCurrentStep(4);
  }

  function isSubmittable(): boolean {
    if (isNonRevenueStay(stayPurpose) && !approvedBy.trim()) {
      toast.warning(t('reservations.stayPurpose.authorityRequired'));
      return false;
    }
    if (stayPurpose === 'HOUSE_USE' && !department.trim()) {
      toast.warning(t('reservations.stayPurpose.departmentRequired'));
      return false;
    }
    if (
      taxExempt &&
      (!taxExemptDocumentRef.trim() || !taxExemptApprovedBy.trim())
    ) {
      toast.warning(t('reservations.taxExempt.fieldsRequired'));
      return false;
    }
    if (isRoomLocked && !roomLockNote.trim()) {
      toast.warning(t('reservations.roomLock.noteRequired'));
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!isSubmittable()) {
      return;
    }
    setSubmitting(true);
    try {
      const reservationData: CreateReservationDto = {
        guestId: selectedGuest!.id,
        roomId: selectedRoom!.id,
        checkIn,
        checkOut,
        adults: numberOfGuests,
        children: 0,
        roomRate: isNonRevenueStay(stayPurpose) ? 0 : firstRate,
        totalAmount,
        specialRequest: specialRequests || undefined,
        status: 'CONFIRMED',
        isDayUse,
        stayPurpose,
        approvedBy: isNonRevenueStay(stayPurpose)
          ? approvedBy.trim()
          : undefined,
        stayPurposeNote: stayPurposeNote.trim() || undefined,
        department: stayPurpose === 'HOUSE_USE' ? department.trim() : undefined,
        billingCycle: isDayUse ? 'NIGHTLY' : billingCycle,
        taxExempt,
        taxExemptReason: taxExempt ? taxExemptReason : undefined,
        taxExemptDocumentRef: taxExempt
          ? taxExemptDocumentRef.trim()
          : undefined,
        taxExemptApprovedBy: taxExempt ? taxExemptApprovedBy.trim() : undefined,
        isRoomLocked,
        roomLockNote: isRoomLocked ? roomLockNote.trim() : undefined,
        stays: isSplitStay
          ? buildSplitStayPayload({
              checkIn,
              splitDate,
              checkOut,
              firstRoomId: selectedRoom!.id,
              secondRoomId: secondRoom!.id,
              firstRate,
              secondRate,
            })
          : undefined,
      };

      const reservation = await reservationsAPI.create(reservationData);
      toast.success(t('reservations.new.createSuccess'));
      router.push(`/reservations/${reservation.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('reservations.new.createFailed'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return {
    currentStep,
    goToStep: setCurrentStep,
    loadingRooms,
    submitting,
    availableRooms,
    selectedRoom,
    setSelectedRoom,
    secondRoom,
    setSecondRoom,
    selectedGuest,
    setSelectedGuest,
    numberOfGuests,
    setNumberOfGuests,
    specialRequests,
    setSpecialRequests,
    handleStep1Next,
    handleStep2Next,
    handleStep3Next,
    handleSubmit,
    dateFields: {
      propertyId,
      onPropertyIdChange: setPropertyId,
      checkIn,
      checkOut,
      onCheckInChange: setCheckIn,
      onCheckOutChange: setCheckOut,
      ...stay.dayUseControl,
    },
    stayPurposeFields: stay.stayPurposeFields,
    taxExemptFields: stay.taxExemptFields,
    roomLockFields: stay.roomLockFields,
    splitStayOptions: stay.splitStayOptions,
    pricing: {
      checkIn,
      checkOut,
      nights,
      isDayUse,
      isSplitStay,
      splitTailNights:
        isSplitStay && splitDate ? calendarNights(splitDate, checkOut) : 0,
      firstRate,
      secondRate,
      totalAmount,
      stayPurpose,
      taxExempt,
      isRoomLocked,
    },
  };
}
