'use client';

import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  readonly checkIn: string;
  readonly checkOut: string;
  readonly onCheckInChange: (date: string) => void;
  readonly onCheckOutChange: (date: string) => void;
  readonly minDate?: string;
  readonly sameDayStay?: boolean;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minDate,
  sameDayStay = false,
}: DateRangePickerProps) {
  const today = minDate || new Date().toISOString().split('T')[0];

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const handleCheckInChange = (date: string) => {
    onCheckInChange(date);
    if (sameDayStay) {
      onCheckOutChange(date);
      return;
    }
    if (checkOut && date >= checkOut) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      onCheckOutChange(nextDay.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        {/* Check-in Date */}
        <div>
          <label
            htmlFor="check-in-date"
            className="block font-semibold mb-2 text-slate-700 text-sm"
          >
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="-translate-y-1/2 absolute h-5 left-3 text-slate-400 top-1/2 w-5" />
            <input
              id="check-in-date"
              name="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={today}
              required
              className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none pl-10 pr-4 py-3 rounded-xl transition-all w-full"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label
            htmlFor="check-out-date"
            className="block font-semibold mb-2 text-slate-700 text-sm"
          >
            Check-out Date
          </label>
          <div className="relative">
            <Calendar className="-translate-y-1/2 absolute h-5 left-3 text-slate-400 top-1/2 w-5" />
            <input
              id="check-out-date"
              name="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              min={checkIn || today}
              required
              disabled={sameDayStay}
              aria-disabled={sameDayStay}
              className="border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none pl-10 pr-4 py-3 rounded-xl transition-all w-full"
            />
          </div>
        </div>
      </div>

      {/* Nights Display */}
      {sameDayStay && checkIn && checkOut ? (
        <div className="bg-amber-50 border border-amber-200 flex items-center justify-center p-3 rounded-xl">
          <p className="font-semibold text-amber-800 text-sm">Day use</p>
        </div>
      ) : (
        nights > 0 && (
          <div className="bg-pura-blue/5 border border-pura-blue/20 flex items-center justify-center p-3 rounded-xl">
            <p className="font-semibold text-pura-blue text-sm">
              {nights} {nights === 1 ? 'night' : 'nights'}
            </p>
          </div>
        )
      )}
    </div>
  );
}
