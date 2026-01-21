'use client';

import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  minDate?: string;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minDate,
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
          <label className="block font-semibold mb-2 text-slate-700 text-sm">
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="-translate-y-1/2 absolute h-5 left-3 text-slate-400 top-1/2 w-5" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={today}
              required
              className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none pl-10 pr-4 py-3 rounded-xl transition-all w-full"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block font-semibold mb-2 text-slate-700 text-sm">
            Check-out Date
          </label>
          <div className="relative">
            <Calendar className="-translate-y-1/2 absolute h-5 left-3 text-slate-400 top-1/2 w-5" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              min={checkIn || today}
              required
              className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none pl-10 pr-4 py-3 rounded-xl transition-all w-full"
            />
          </div>
        </div>
      </div>

      {/* Nights Display */}
      {nights > 0 && (
        <div className="bg-[#1e4b8e]/5 border border-[#1e4b8e]/20 flex items-center justify-center p-3 rounded-xl">
          <p className="font-semibold text-[#1e4b8e] text-sm">
            {nights} {nights === 1 ? 'night' : 'nights'}
          </p>
        </div>
      )}
    </div>
  );
}
