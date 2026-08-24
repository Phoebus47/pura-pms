'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { PropertySelector } from '@/components/property-selector';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { expandCalendarOccupancy } from '@/lib/split-stay';
import { formatMessage, t } from '@/lib/i18n';

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const LEGEND_STATUSES = [
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
] as const;

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
      toast.error(t('reservations.calendar.loadFailed'));
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

  function getReservationsForDay(day: number) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return expandCalendarOccupancy(reservations).filter((item) => {
      const checkIn = item.checkIn.split('T')[0];
      const checkOut = item.checkOut.split('T')[0];
      return dateStr >= checkIn && dateStr < checkOut;
    });
  }

  const monthLabel = t(`reservations.calendar.months.${MONTH_KEYS[month]}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-3xl text-pura-blue">
            {t('reservations.calendar.title')}
          </h1>
          <p className="mt-1 text-slate-600">
            {monthLabel} {year}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <Button onClick={goToToday} variant="outline">
            {t('reservations.calendar.today')}
          </Button>
          <div className="flex gap-2 items-center">
            <Button
              onClick={previousMonth}
              variant="outline"
              className="p-2"
              aria-label={t('reservations.calendar.previousMonth')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              className="p-2"
              aria-label={t('reservations.calendar.nextMonth')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div className="flex gap-4 items-center">
          <Filter className="h-5 text-slate-600 w-5" />
          <div className="flex-1">
            <label
              htmlFor="property-filter"
              className="block font-semibold mb-2 text-slate-700 text-sm"
            >
              {t('reservations.calendar.filterByProperty')}
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
            <div className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"></div>
            <p className="mt-4 text-slate-600">
              {t('reservations.calendar.loading')}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden p-6 rounded-xl shadow-sm">
          {/* Day Headers */}
          <div className="gap-2 grid grid-cols-7 mb-4">
            {WEEKDAY_KEYS.map((dayKey) => (
              <div
                key={dayKey}
                className="font-bold py-2 text-center text-slate-700"
              >
                {t(`reservations.calendar.weekdays.${dayKey}`)}
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
                  className={`aspect-square rounded-lg border-2 p-2 transition-colors ${
                    isToday
                      ? 'border-pura-blue bg-pura-blue/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`text-sm font-bold mb-1 ${
                        isToday ? 'text-pura-blue' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {dayReservations.slice(0, 3).map((item) => (
                        <div
                          key={item.key}
                          className="bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 p-1 rounded text-xs transition-colors truncate"
                          title={formatMessage(
                            'reservations.calendar.occupantTooltip',
                            {
                              guestName: item.guestName,
                              roomLabel: t('common.roomLabel'),
                              roomNumber: item.roomNumber ?? '',
                            },
                          )}
                        >
                          <ReservationStatusBadge
                            status={item.status as Reservation['status']}
                            size="xs"
                          />
                          {item.isSplitStay ? (
                            <SplitStayBadge size="xs" className="ml-1" />
                          ) : null}
                          <div className="mt-0.5 truncate">
                            {item.guestName}
                          </div>
                        </div>
                      ))}
                      {dayReservations.length > 3 && (
                        <div className="font-semibold text-slate-500 text-xs">
                          {formatMessage('reservations.calendar.more', {
                            count: dayReservations.length - 3,
                          })}
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
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4 text-lg text-pura-blue">
          {t('reservations.calendar.legend')}
        </h3>
        <div className="flex flex-wrap gap-4">
          {LEGEND_STATUSES.map((status) => (
            <div key={status} className="flex gap-2 items-center">
              <ReservationStatusBadge status={status} />
              <span className="text-slate-600 text-sm">
                {t(`reservations.status.${status}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
