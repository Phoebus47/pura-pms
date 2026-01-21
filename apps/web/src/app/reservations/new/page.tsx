"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  reservationsAPI,
  roomsAPI,
  type Room,
  type Guest,
  type CreateReservationDto,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { PropertySelector } from "@/components/property-selector";
import { GuestSearchDialog } from "@/components/guest-search-dialog";
import { GuestFormDialog } from "@/components/guest-form-dialog";

type Step = 1 | 2 | 3 | 4;

export default function NewReservationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Dates and Property
  const [propertyId, setPropertyId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // Step 2: Room Selection
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Step 3: Guest Selection
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isGuestSearchOpen, setIsGuestSearchOpen] = useState(false);
  const [isGuestFormOpen, setIsGuestFormOpen] = useState(false);

  // Step 4: Confirmation
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleStep1Next() {
    if (!propertyId || !checkIn || !checkOut) {
      alert("Please select property and dates");
      return;
    }

    // Load available rooms
    setLoadingRooms(true);
    try {
      const rooms = await roomsAPI.getAll({
        propertyId,
        status: "VACANT_CLEAN",
      });
      setAvailableRooms(rooms);
      setCurrentStep(2);
    } catch {
      alert("Failed to load available rooms");
    } finally {
      setLoadingRooms(false);
    }
  }

  function handleStep2Next() {
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }
    setCurrentStep(3);
  }

  function handleStep3Next() {
    if (!selectedGuest) {
      alert("Please select a guest");
      return;
    }
    setCurrentStep(4);
  }

  async function handleSubmit() {
    if (!selectedRoom || !selectedGuest) return;

    setSubmitting(true);
    try {
      const baseRate = Number(selectedRoom.roomType?.baseRate || 0);
      const calculatedTotal = baseRate * nights;

      const reservationData: CreateReservationDto = {
        guestId: selectedGuest.id,
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        adults: numberOfGuests,
        children: 0,
        roomRate: baseRate,
        totalAmount: calculatedTotal,
        specialRequest: specialRequests || undefined,
        status: "CONFIRMED",
      };

      const reservation = await reservationsAPI.create(reservationData);
      alert("Reservation created successfully!");
      router.push(`/reservations/${reservation.id}`);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to create reservation",
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
  }

  const steps = [
    { number: 1, title: "Dates & Property", icon: Calendar },
    { number: 2, title: "Select Room", icon: CreditCard },
    { number: 3, title: "Guest Info", icon: User },
    { number: 4, title: "Confirm", icon: Check },
  ];

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const totalAmount =
    selectedRoom && nights > 0
      ? Number(selectedRoom.roomType?.baseRate || 0) * nights
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e4b8e]">New Reservation</h1>
        <p className="text-slate-600 mt-1">Create a new booking step by step</p>
      </div>

      {/* Progress Steps */}
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.number
                      ? "bg-[#1e4b8e] text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <p
                  className={`text-sm font-semibold mt-2 ${
                    currentStep >= step.number
                      ? "text-[#1e4b8e]"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 rounded transition-all ${
                    currentStep > step.number ? "bg-[#1e4b8e]" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-8 shadow-xl">
        {/* Step 1: Dates & Property */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1e4b8e]">
              Select Dates and Property
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Property *
              </label>
              <PropertySelector
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
            />

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleStep1Next}
                disabled={!propertyId || !checkIn || !checkOut || loadingRooms}
                className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
              >
                {loadingRooms ? "Loading..." : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1e4b8e]">Select a Room</h2>

            {availableRooms.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No available rooms for selected dates
              </p>
            ) : (
              <div className="grid gap-4">
                {availableRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedRoom?.id === room.id
                        ? "border-[#1e4b8e] bg-[#1e4b8e]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          Room {room.number}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {room.roomType?.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Max {room.roomType?.maxOccupancy} guests
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#1e4b8e]">
                          ฿
                          {Number(
                            room.roomType?.baseRate || 0,
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">per night</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleStep2Next}
                disabled={!selectedRoom}
                className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Guest Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1e4b8e]">Select Guest</h2>

            {selectedGuest ? (
              <div className="p-4 rounded-2xl border-2 border-[#1e4b8e] bg-[#1e4b8e]/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {selectedGuest.firstName} {selectedGuest.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedGuest.email}
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedGuest.phone}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedGuest(null)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={() => setIsGuestSearchOpen(true)}
                  className="flex-1 rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
                >
                  Search Existing Guest
                </Button>
                <Button
                  onClick={() => setIsGuestFormOpen(true)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Create New Guest
                </Button>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleStep3Next}
                disabled={!selectedGuest}
                className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1e4b8e]">
              Confirm Reservation
            </h2>

            {/* Summary */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50">
                <h3 className="font-semibold text-slate-700 mb-2">
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
                    <span className="font-semibold">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room:</span>
                    <span className="font-semibold">
                      Room {selectedRoom?.number} -{" "}
                      {selectedRoom?.roomType?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Guest:</span>
                    <span className="font-semibold">
                      {selectedGuest?.firstName} {selectedGuest?.lastName}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  value={numberOfGuests}
                  onChange={(e) =>
                    setNumberOfGuests(parseInt(e.target.value) || 1)
                  }
                  min="1"
                  max={selectedRoom?.roomType?.maxOccupancy || 4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Any special requests or notes..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all resize-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#1e4b8e]/5 border-2 border-[#1e4b8e]">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-700">
                    Total Amount:
                  </span>
                  <span className="text-3xl font-bold text-[#1e4b8e]">
                    ฿{totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ฿
                  {Number(
                    selectedRoom?.roomType?.baseRate || 0,
                  ).toLocaleString()}{" "}
                  × {nights} nights
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="outline"
                className="rounded-xl"
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
              >
                {submitting ? "Creating..." : "Confirm Reservation"}
                <Check className="h-4 w-4 ml-2" />
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
