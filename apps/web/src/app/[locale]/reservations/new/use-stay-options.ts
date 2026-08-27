'use client';

import { useState } from 'react';
import { isExtendedBillingCycle, type BillingCycle } from '@/lib/billing-cycle';
import type { StayPurpose } from '@/lib/stay-purpose';
import type { TaxExemptReason } from '@/lib/tax-exemption';

interface StayOptionsDeps {
  readonly checkIn: string;
  readonly checkOut: string;
  readonly setCheckOut: (value: string) => void;
  readonly clearSecondRoom: () => void;
}

const DAY_MS = 86400000;

function nextCalendarDay(value: string): string {
  const day = new Date(value);
  day.setDate(day.getDate() + 1);
  return day.toISOString().split('T')[0];
}

function shiftByDays(value: string, days: number): string {
  return new Date(new Date(value).getTime() + days * DAY_MS)
    .toISOString()
    .split('T')[0];
}

export function useStayOptions({
  checkIn,
  checkOut,
  setCheckOut,
  clearSecondRoom,
}: StayOptionsDeps) {
  const [isDayUse, setIsDayUse] = useState(false);
  const [stayPurpose, setStayPurpose] = useState<StayPurpose>('STANDARD');
  const [approvedBy, setApprovedBy] = useState('');
  const [stayPurposeNote, setStayPurposeNote] = useState('');
  const [department, setDepartment] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('NIGHTLY');
  const [taxExempt, setTaxExempt] = useState(false);
  const [taxExemptReason, setTaxExemptReason] =
    useState<TaxExemptReason>('DIPLOMATIC');
  const [taxExemptDocumentRef, setTaxExemptDocumentRef] = useState('');
  const [taxExemptApprovedBy, setTaxExemptApprovedBy] = useState('');
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [roomLockNote, setRoomLockNote] = useState('');
  const [isSplitStay, setIsSplitStay] = useState(false);
  const [splitDate, setSplitDate] = useState('');

  function handleDayUseChange(checked: boolean) {
    setIsDayUse(checked);
    if (checked) {
      setIsSplitStay(false);
      clearSecondRoom();
      setBillingCycle('NIGHTLY');
    }
    if (checked && checkIn) {
      setCheckOut(checkIn);
      return;
    }
    if (!checked && checkIn && checkOut === checkIn) {
      setCheckOut(nextCalendarDay(checkIn));
    }
  }

  function handleSplitStayChange(enabled: boolean) {
    setIsSplitStay(enabled);
    if (enabled) {
      setIsDayUse(false);
      if (checkIn && checkOut && !splitDate) {
        const next = nextCalendarDay(checkIn);
        if (next < checkOut) {
          setSplitDate(next);
        }
      }
      return;
    }
    clearSecondRoom();
  }

  function handleRoomLockChange(checked: boolean) {
    setIsRoomLocked(checked);
    if (checked) {
      setIsSplitStay(false);
      clearSecondRoom();
    }
  }

  function handleBillingCycleChange(value: BillingCycle) {
    setBillingCycle(value);
    if (isExtendedBillingCycle(value)) {
      setIsDayUse(false);
      setIsSplitStay(false);
      clearSecondRoom();
    }
  }

  return {
    values: {
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
    },
    dayUseControl: {
      isDayUse,
      onDayUseChange: handleDayUseChange,
      billingCycle,
      onBillingCycleChange: handleBillingCycleChange,
    },
    stayPurposeFields: {
      stayPurpose,
      onStayPurposeChange: setStayPurpose,
      approvedBy,
      onApprovedByChange: setApprovedBy,
      stayPurposeNote,
      onStayPurposeNoteChange: setStayPurposeNote,
      department,
      onDepartmentChange: setDepartment,
    },
    taxExemptFields: {
      taxExempt,
      onTaxExemptChange: setTaxExempt,
      taxExemptReason,
      onTaxExemptReasonChange: setTaxExemptReason,
      taxExemptDocumentRef,
      onTaxExemptDocumentRefChange: setTaxExemptDocumentRef,
      taxExemptApprovedBy,
      onTaxExemptApprovedByChange: setTaxExemptApprovedBy,
    },
    roomLockFields: {
      isRoomLocked,
      onIsRoomLockedChange: handleRoomLockChange,
      roomLockNote,
      onRoomLockNoteChange: setRoomLockNote,
      disabled: isSplitStay,
    },
    splitStayOptions: {
      enabled: isSplitStay,
      disabled:
        isDayUse || isExtendedBillingCycle(billingCycle) || isRoomLocked,
      splitDate,
      minDate: checkIn ? shiftByDays(checkIn, 1) : '',
      maxDate: checkOut ? shiftByDays(checkOut, -1) : '',
      onEnabledChange: handleSplitStayChange,
      onSplitDateChange: setSplitDate,
    },
  };
}
