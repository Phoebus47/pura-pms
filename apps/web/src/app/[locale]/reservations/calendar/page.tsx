'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { PropertySelector } from '@/components/property-selector';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { Toolbar } from '@/components/shared/toolbar';
import { expandCalendarOccupancy } from '@/lib/split-stay';
import { t } from '@/lib/i18n';
import { CalendarDayCell } from './calendar-day-cell';

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

  const days: (number | null)[] = [];
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
  const today = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reservations.calendar.title')}
        subtitle={`${monthLabel} ${year}`}
        actions={
          <>
            <Button onClick={goToToday} variant="outline">
              {t('reservations.calendar.today')}
            </Button>
            <div className="flex gap-2 items-center">
              <Button
                onClick={previousMonth}
                variant="outline"
                size="icon"
                aria-label={t('reservations.calendar.previousMonth')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={nextMonth}
                variant="outline"
                size="icon"
                aria-label={t('reservations.calendar.nextMonth')}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        }
      />

      <Toolbar
        filters={
          <div className="flex gap-3 items-center w-full">
            <Filter className="h-5 shrink-0 text-ink-subtle w-5" aria-hidden />
            <label
              htmlFor="property-filter"
              className="font-semibold shrink-0 text-ink-default text-sm"
            >
              {t('reservations.calendar.filterByProperty')}
            </label>
            <div className="min-w-0 sm:w-72 w-full">
              <PropertySelector
                id="property-filter"
                value={propertyFilter}
                onChange={setPropertyFilter}
              />
            </div>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner message={t('reservations.calendar.loading')} />
      ) : (
        <Panel padding="lg" className="overflow-hidden">
          <div className="gap-2 grid grid-cols-7 mb-4">
            {WEEKDAY_KEYS.map((dayKey) => (
              <div
                key={dayKey}
                className="font-semibold py-2 text-2xs text-center text-ink-subtle tracking-wide uppercase"
              >
                {t(`reservations.calendar.weekdays.${dayKey}`)}
              </div>
            ))}
          </div>

          <div className="gap-2 grid grid-cols-7">
            {days.map((day, index) =>
              day === null ? (
                <div
                  key={`empty-${year}-${month}-${index}`}
                  className="aspect-square"
                />
              ) : (
                <CalendarDayCell
                  key={`day-${day}`}
                  day={day}
                  isToday={
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear()
                  }
                  occupants={getReservationsForDay(day)}
                />
              ),
            )}
          </div>
        </Panel>
      )}

      <Panel title={t('reservations.calendar.legend')} padding="lg">
        <div className="flex flex-wrap gap-4">
          {LEGEND_STATUSES.map((status) => (
            <div key={status} className="flex gap-2 items-center">
              <ReservationStatusBadge status={status} />
              <span className="text-ink-subtle text-sm">
                {t(`reservations.status.${status}`)}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
