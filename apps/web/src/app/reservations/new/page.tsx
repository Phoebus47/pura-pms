'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  User,
  CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  reservationsAPI,
  roomsAPI,
  type Room,
  type Guest,
  type CreateReservationDto,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { PropertySelector } from '@/components/property-selector';
import { GuestSearchDialog } from '@/components/guest-search-dialog';
import { GuestFormDialog } from '@/components/guest-form-dialog';
import { toast } from '@/lib/toast';
import { DayUseBadge } from '@/components/day-use-badge';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { StayPurposeFields } from '@/components/stay-purpose-fields';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { SplitStayOptions } from '@/components/split-stay-options';
import { t } from '@/lib/i18n';
import { buildSplitStayPayload, calendarNights } from '@/lib/split-stay';
import { isNonRevenueStay, type StayPurpose } from '@/lib/stay-purpose';

type Step = 1 | 2 | 3 | 4;

export default function NewReservationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [propertyId, setPropertyId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isGuestSearchOpen, setIsGuestSearchOpen] = useState(false);
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);

  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isDayUse, setIsDayUse] = useState(false);
  const [stayPurpose, setStayPurpose] = useState<StayPurpose>('STANDARD');
  const [approvedBy, setApprovedBy] = useState('');
  const [stayPurposeNote, setStayPurposeNote] = useState('');
  const [department, setDepartment] = useState('');
  const [isSplitStay, setIsSplitStay] = useState(false);
  const [splitDate, setSplitDate] = useState('');
  const [secondRoom, setSecondRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleDayUseChange(checked: boolean) {
    setIsDayUse(checked);
    if (checked) {
      setIsSplitStay(false);
      setSecondRoom(null);
    }
    if (checked && checkIn) {
      setCheckOut(checkIn);
      return;
    }
    if (!checked && checkIn && checkOut === checkIn) {
      const nextDay = new Date(checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  }

  function handleSplitStayChange(enabled: boolean) {
    setIsSplitStay(enabled);
    if (enabled) {
      setIsDayUse(false);
      if (checkIn && checkOut && !splitDate) {
        const nextDay = new Date(checkIn);
        nextDay.setDate(nextDay.getDate() + 1);
        const next = nextDay.toISOString().split('T')[0];
        if (next < checkOut) {
          setSplitDate(next);
        }
      }
      return;
    }
    setSecondRoom(null);
  }

  async function handleStep1Next() {
    if (!propertyId || !checkIn || !checkOut) {
      toast.warning('Please select property and dates');
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
      toast.error('Failed to load available rooms');
    } finally {
      setLoadingRooms(false);
    }
  }

  function handleStep2Next() {
    if (!selectedRoom) {
      toast.warning('Please select a room');
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
      toast.warning('Please select a guest');
      return;
    }
    setCurrentStep(4);
  }

  async function handleSubmit() {
    if (isNonRevenueStay(stayPurpose) && !approvedBy.trim()) {
      toast.warning(t('reservations.stayPurpose.authorityRequired'));
      return;
    }
    if (stayPurpose === 'HOUSE_USE' && !department.trim()) {
      toast.warning(t('reservations.stayPurpose.departmentRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const firstRate = Number(selectedRoom!.roomType?.baseRate || 0);
      const secondRate = Number(secondRoom?.roomType?.baseRate || 0);
      const stays = isSplitStay
        ? buildSplitStayPayload({
            checkIn,
            splitDate,
            checkOut,
            firstRoomId: selectedRoom!.id,
            secondRoomId: secondRoom!.id,
            firstRate,
            secondRate,
          })
        : undefined;
      const calculatedTotal = stays
        ? calendarNights(checkIn, splitDate) * firstRate +
          calendarNights(splitDate, checkOut) * secondRate
        : firstRate * billedNights;

      const billedRate = isNonRevenueStay(stayPurpose) ? 0 : firstRate;
      const billedTotal = isNonRevenueStay(stayPurpose) ? 0 : calculatedTotal;

      const reservationData: CreateReservationDto = {
        guestId: selectedGuest!.id,
        roomId: selectedRoom!.id,
        checkIn,
        checkOut,
        adults: numberOfGuests,
        children: 0,
        roomRate: billedRate,
        totalAmount: billedTotal,
        specialRequest: specialRequests || undefined,
        status: 'CONFIRMED',
        isDayUse,
        stayPurpose,
        approvedBy: isNonRevenueStay(stayPurpose)
          ? approvedBy.trim()
          : undefined,
        stayPurposeNote: stayPurposeNote.trim() || undefined,
        department: stayPurpose === 'HOUSE_USE' ? department.trim() : undefined,
        stays,
      };

      const reservation = await reservationsAPI.create(reservationData);
      toast.success('Reservation created successfully!');
      router.push(`/reservations/${reservation.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create reservation',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGuestSelect(guest: Guest) {
    setSelectedGuest(guest);
  }

  function handleGuestCreated(guest: Guest) {
    setSelectedGuest(guest);
    setIsGuestFormOpen(false);
  }

  const steps = [
    { number: 1, title: 'Dates & Property', icon: Calendar },
    { number: 2, title: 'Select Room', icon: CreditCard },
    { number: 3, title: 'Guest Info', icon: User },
    { number: 4, title: 'Confirm', icon: Check },
  ];

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
    : firstRate * billedNights;
  const totalAmount = isNonRevenueStay(stayPurpose) ? 0 : rackTotal;
  const splitMinDate = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000)
        .toISOString()
        .split('T')[0]
    : '';
  const splitMaxDate = checkOut
    ? new Date(new Date(checkOut).getTime() - 86400000)
        .toISOString()
        .split('T')[0]
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl text-pura-blue">New Reservation</h1>
        <p className="mt-1 text-slate-600">Create a new booking step by step</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= step.number
                      ? 'bg-pura-blue text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <p
                  className={`text-sm font-semibold mt-2 ${
                    currentStep >= step.number
                      ? 'text-pura-blue'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 rounded transition-colors ${
                    currentStep > step.number ? 'bg-pura-blue' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
        {/* Step 1: Dates & Property */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-pura-blue">
              Select Dates and Property
            </h2>

            <div>
              <label
                htmlFor="property-select"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Property *
              </label>
              <PropertySelector
                id="property-select"
                value={propertyId}
                onChange={setPropertyId}
                required
              />
            </div>

            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
              sameDayStay={isDayUse}
            />

            <label className="cursor-pointer flex gap-3 items-start min-h-11">
              <input
                id="day-use"
                name="isDayUse"
                type="checkbox"
                checked={isDayUse}
                onChange={(e) => handleDayUseChange(e.target.checked)}
                className="border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pura-blue h-4 mt-1 rounded text-pura-blue w-4"
              />
              <span>
                <span className="block font-semibold text-slate-700 text-sm">
                  Day-use stay
                </span>
                <span className="block mt-1 text-slate-500 text-xs">
                  Same-day check-in and check-out. Night Audit will not post a
                  room charge.
                </span>
              </span>
            </label>

            <StayPurposeFields
              stayPurpose={stayPurpose}
              onStayPurposeChange={setStayPurpose}
              approvedBy={approvedBy}
              onApprovedByChange={setApprovedBy}
              stayPurposeNote={stayPurposeNote}
              onStayPurposeNoteChange={setStayPurposeNote}
              department={department}
              onDepartmentChange={setDepartment}
            />

            <SplitStayOptions
              enabled={isSplitStay}
              disabled={isDayUse}
              splitDate={splitDate}
              minDate={splitMinDate}
              maxDate={splitMaxDate}
              onEnabledChange={handleSplitStayChange}
              onSplitDateChange={setSplitDate}
            />

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleStep1Next}
                className="bg-pura-blue hover:bg-pura-blue-dark"
              >
                {loadingRooms ? 'Loading...' : 'Next'}
                <ArrowRight className="h-4 ml-2 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-pura-blue">
              {isSplitStay
                ? t('reservations.splitStay.firstRoom')
                : 'Select a Room'}
            </h2>

            {availableRooms.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                No available rooms for selected dates
              </p>
            ) : (
              <div className="gap-4 grid">
                {availableRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    aria-label={`Room ${room.number}`}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'border-pura-blue bg-pura-blue/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          Room {room.number}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {room.roomType?.name}
                        </p>
                        <p className="mt-1 text-slate-500 text-xs">
                          Max {room.roomType?.maxOccupancy} guests
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-pura-blue">
                          ฿
                          {Number(
                            room.roomType?.baseRate || 0,
                          ).toLocaleString()}
                        </p>
                        <p className="text-slate-500 text-xs">per night</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isSplitStay ? (
              <div className="space-y-4">
                <h3 className="font-bold text-pura-blue text-xl">
                  {t('reservations.splitStay.secondRoom')}
                </h3>
                <div className="gap-4 grid">
                  {availableRooms
                    .filter((room) => room.id !== selectedRoom?.id)
                    .map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        aria-label={`${t('reservations.splitStay.secondRoom')} ${room.number}`}
                        onClick={() => setSecondRoom(room)}
                        className={`min-h-11 p-4 rounded-xl border-2 text-left transition-colors ${
                          secondRoom?.id === room.id
                            ? 'border-pura-blue bg-pura-blue/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <h3 className="font-bold text-lg text-slate-800">
                          Room {room.number}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {room.roomType?.name}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-between pt-4">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                <ArrowLeft className="h-4 mr-2 w-4" />
                Back
              </Button>
              <Button
                onClick={handleStep2Next}
                className="bg-pura-blue hover:bg-pura-blue-dark"
              >
                Next
                <ArrowRight className="h-4 ml-2 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Guest Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-pura-blue">Select Guest</h2>

            {selectedGuest ? (
              <div className="bg-pura-blue/5 border-2 border-pura-blue p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {selectedGuest.firstName} {selectedGuest.lastName}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {selectedGuest.email}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {selectedGuest.phone}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedGuest(null)}
                    variant="outline"
                    size="sm"
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={() => setIsGuestSearchOpen(true)}
                  className="bg-pura-blue flex-1 hover:bg-pura-blue-dark"
                >
                  Search Existing Guest
                </Button>
                <Button
                  onClick={() => setIsGuestFormOpen(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Create New Guest
                </Button>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button onClick={() => setCurrentStep(2)} variant="outline">
                <ArrowLeft className="h-4 mr-2 w-4" />
                Back
              </Button>
              <Button
                onClick={handleStep3Next}
                className="bg-pura-blue hover:bg-pura-blue-dark"
              >
                Next
                <ArrowRight className="h-4 ml-2 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="font-bold text-2xl text-pura-blue">
              Confirm Reservation
            </h2>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-semibold mb-2 text-slate-700">
                  Booking Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-in:</span>
                    <span className="font-semibold">
                      {new Date(checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-out:</span>
                    <span className="font-semibold">
                      {new Date(checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Nights:</span>
                    <span className="font-semibold">
                      {isDayUse ? <DayUseBadge /> : nights}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room:</span>
                    <span className="font-semibold">
                      Room {selectedRoom?.number} -{' '}
                      {selectedRoom?.roomType?.name}
                      {isSplitStay ? <SplitStayBadge className="ml-2" /> : null}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Guest:</span>
                    <span className="font-semibold">
                      {selectedGuest?.firstName} {selectedGuest?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      {t('reservations.stayPurpose.label')}:
                    </span>
                    <span className="font-semibold">
                      {isNonRevenueStay(stayPurpose) ? (
                        <StayPurposeBadge stayPurpose={stayPurpose} />
                      ) : (
                        t('reservations.stayPurpose.standard')
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <StayPurposeFields
                stayPurpose={stayPurpose}
                onStayPurposeChange={setStayPurpose}
                approvedBy={approvedBy}
                onApprovedByChange={setApprovedBy}
                stayPurposeNote={stayPurposeNote}
                onStayPurposeNoteChange={setStayPurposeNote}
                department={department}
                onDepartmentChange={setDepartment}
                showAuthority
              />

              <div>
                <label
                  htmlFor="number-of-guests"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Number of Guests
                </label>
                <input
                  id="number-of-guests"
                  name="numberOfGuests"
                  type="number"
                  value={numberOfGuests}
                  onChange={(e) =>
                    setNumberOfGuests(Number.parseInt(e.target.value) || 1)
                  }
                  min="1"
                  max={selectedRoom?.roomType?.maxOccupancy || 4}
                  className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="special-requests"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Special Requests
                </label>
                <textarea
                  id="special-requests"
                  name="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Any special requests or notes..."
                  className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 resize-none rounded-xl transition-all w-full"
                />
              </div>

              <div className="bg-pura-blue/5 border-2 border-pura-blue p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg text-slate-700">
                    Total Amount:
                  </span>
                  <span className="font-bold text-3xl text-pura-blue">
                    ฿{totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-slate-500 text-xs">
                  ฿
                  {Number(
                    selectedRoom?.roomType?.baseRate || 0,
                  ).toLocaleString()}{' '}
                  × {isDayUse ? '1 day use' : `${nights} nights`}
                  {isSplitStay && secondRoom
                    ? ` + ฿${secondRate.toLocaleString()} × ${calendarNights(splitDate, checkOut)} nights`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="outline"
                disabled={submitting}
              >
                <ArrowLeft className="h-4 mr-2 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-pura-blue hover:bg-pura-blue-dark"
              >
                {submitting ? 'Creating...' : 'Confirm Reservation'}
                <Check className="h-4 ml-2 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Guest Search Dialog */}
      <GuestSearchDialog
        isOpen={isGuestSearchOpen}
        onClose={() => setIsGuestSearchOpen(false)}
        onSelectGuest={handleGuestSelect}
        onCreateNew={() => {
          setIsGuestSearchOpen(false);
          setIsGuestFormOpen(true);
        }}
      />

      {/* Guest Form Dialog */}
      <GuestFormDialog
        isOpen={isGuestFormOpen}
        onClose={() => setIsGuestFormOpen(false)}
        onSuccess={handleGuestCreated}
      />
    </div>
  );
}
