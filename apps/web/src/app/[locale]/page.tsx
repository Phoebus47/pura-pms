'use client';

import { useEffect, useState } from 'react';
import { reservationsAPI, roomsAPI } from '@/lib/api';
import { toast } from '@/lib/toast';
import { t } from '@/lib/i18n';
import {
  buildShiftOpsSnapshot,
  type ShiftOpsSnapshot,
} from '@/lib/dashboard/shift-ops';
import { ShiftOpsNowStrip } from '@/components/dashboard/shift-ops-now-strip';
import { ShiftOpsQueues } from '@/components/dashboard/shift-ops-queues';
import { ShiftOpsExceptions } from '@/components/dashboard/shift-ops-exceptions';
import { ShiftOpsWorkList } from '@/components/dashboard/shift-ops-work-list';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function Dashboard() {
  const [snapshot, setSnapshot] = useState<ShiftOpsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [reservations, rooms] = await Promise.all([
          reservationsAPI.getAll(),
          roomsAPI.getAll(),
        ]);
        if (!cancelled) {
          setSnapshot(buildShiftOpsSnapshot(reservations, rooms));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : t('dashboard.loadFailed'),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !snapshot) {
    return <LoadingSpinner message={t('shiftOps.loading')} />;
  }

  return (
    <div className="max-w-7xl md:space-y-6 mx-auto space-y-5">
      <ShiftOpsNowStrip
        businessDate={snapshot.businessDate}
        propertyName={snapshot.propertyName}
        occupancyRate={snapshot.occupancyRate}
        readyToSell={snapshot.readyToSell}
        totalRooms={snapshot.totalRooms}
      />
      <ShiftOpsQueues
        arrivals={snapshot.arrivals}
        departures={snapshot.departures}
        unassigned={snapshot.unassigned}
      />
      <ShiftOpsExceptions
        vipCount={snapshot.vipCount}
        dirtyRooms={snapshot.dirtyRooms}
        balanceDueCount={snapshot.balanceDueCount}
      />
      <ShiftOpsWorkList items={snapshot.workItems} />
    </div>
  );
}
