'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { PropertySelector } from '@/components/property-selector';

export default function ReservationCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState('');

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);

      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const filters: Record<string, string> = {
        checkIn: firstDay.toISOString().split('T')[0],
        checkOut: lastDay.toISOString().split('T')[0],
      };

      if (propertyFilter) {
        filters.propertyId = propertyFilter;
      }

      const data = await reservationsAPI.getAll(filters);
      setReservations(data);
    } catch {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [currentDate, propertyFilter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  function previousMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  function getReservationsForDay(day: number): Reservation[] {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return reservations.filter((r) => {
      const checkIn = r.checkIn.split('T')[0];
      const checkOut = r.checkOut.split('T')[0];
      return dateStr >= checkIn && dateStr < checkOut;
    });
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">
            Reservation Calendar
          </h1>
          <p className="mt-1 text-slate-600">
            {monthNames[month]} {year}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <Button onClick={goToToday} variant="outline" className="rounded-xl">
            Today
          </Button>
          <div className="flex gap-2 items-center">
            <Button
              onClick={previousMonth}
              variant="outline"
              className="p-2 rounded-xl"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              className="p-2 rounded-xl"
              aria-label="Next Month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
        <div className="flex gap-4 items-center">
          <Filter className="h-5 text-slate-600 w-5" />
          <div className="flex-1">
            <label
              htmlFor="property-filter"
              className="block font-semibold mb-2 text-slate-700 text-sm"
            >
              Filter by Property
            </label>
            <PropertySelector
              id="property-filter"
              value={propertyFilter}
              onChange={setPropertyFilter}
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
            <p className="mt-4 text-slate-600">Loading calendar...</p>
          </div>
        </div>
      ) : (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 overflow-hidden p-6 rounded-3xl shadow-xl">
          {/* Day Headers */}
          <div className="gap-2 grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="font-bold py-2 text-center text-slate-700"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="gap-2 grid grid-cols-7">
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${year}-${month}-${index}`}
                    className="aspect-square"
                  />
                );
              }

              const dayReservations = getReservationsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={`day-${day}`}
                  className={`aspect-square rounded-2xl border-2 p-2 transition-all ${
                    isToday
                      ? 'border-[#1e4b8e] bg-[#1e4b8e]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`text-sm font-bold mb-1 ${
                        isToday ? 'text-[#1e4b8e]' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {dayReservations.slice(0, 3).map((reservation) => (
                        <div
                          key={reservation.id}
                          className="bg-white/80 border border-slate-200 cursor-pointer hover:bg-white p-1 rounded text-xs transition-colors truncate"
                          title={`${reservation.guest?.firstName} ${reservation.guest?.lastName} - Room ${reservation.room?.number}`}
                        >
                          <ReservationStatusBadge
                            status={reservation.status}
                            size="xs"
                          />
                          <div className="mt-0.5 truncate">
                            {reservation.guest?.firstName}{' '}
                            {reservation.guest?.lastName}
                          </div>
                        </div>
                      ))}
                      {dayReservations.length > 3 && (
                        <div className="font-semibold text-slate-500 text-xs">
                          +{dayReservations.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
        <h3 className="font-bold mb-4 text-[#1e4b8e] text-lg">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2 items-center">
            <ReservationStatusBadge status="CONFIRMED" />
            <span className="text-slate-600 text-sm">Confirmed</span>
          </div>
          <div className="flex gap-2 items-center">
            <ReservationStatusBadge status="CHECKED_IN" />
            <span className="text-slate-600 text-sm">Checked In</span>
          </div>
          <div className="flex gap-2 items-center">
            <ReservationStatusBadge status="CHECKED_OUT" />
            <span className="text-slate-600 text-sm">Checked Out</span>
          </div>
          <div className="flex gap-2 items-center">
            <ReservationStatusBadge status="CANCELLED" />
            <span className="text-slate-600 text-sm">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
