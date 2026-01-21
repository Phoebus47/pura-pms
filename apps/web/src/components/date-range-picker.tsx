"use client";

import { Calendar } from "lucide-react";

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
  const today = minDate || new Date().toISOString().split("T")[0];

  // Calculate nights
  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  // Auto-adjust checkout if it's before checkin
  const handleCheckInChange = (date: string) => {
    onCheckInChange(date);
    if (checkOut && date >= checkOut) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      onCheckOutChange(nextDay.toISOString().split("T")[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Check-in Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => handleCheckInChange(e.target.value)}
              min={today}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Check-out Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              min={checkIn || today}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Nights Display */}
      {nights > 0 && (
        <div className="flex items-center justify-center p-3 bg-[#1e4b8e]/5 rounded-xl border border-[#1e4b8e]/20">
          <p className="text-sm font-semibold text-[#1e4b8e]">
            {nights} {nights === 1 ? "night" : "nights"}
          </p>
        </div>
      )}
    </div>
  );
}
