'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  Bed,
  CreditCard,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { reservationsAPI, roomsAPI, type Reservation } from '@/lib/api';
import { toast } from '@/lib/toast';
import { formatMessage, t } from '@/lib/i18n';
import {
  RecentReservationRow,
  StatCard,
  type StatCardItem,
} from './dashboard-cards';

interface DashboardStats {
  totalReservations: number;
  checkedIn: number;
  availableRooms: number;
  totalRooms: number;
  revenueToday: number;
  occupancyRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    checkedIn: 0,
    availableRooms: 0,
    totalRooms: 0,
    revenueToday: 0,
    occupancyRate: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const [reservations, rooms] = await Promise.all([
        reservationsAPI.getAll(),
        roomsAPI.getAll(),
      ]);

      const checkedInCount = reservations.filter(
        (r) => r.status === 'CHECKED_IN',
      ).length;
      const availableRoomsCount = rooms.filter(
        (r) => r.status === 'VACANT_CLEAN' || r.status === 'VACANT_DIRTY',
      ).length;

      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = reservations
        .filter((r) => r.status === 'CHECKED_IN' && r.checkIn.startsWith(today))
        .reduce((sum, r) => sum + Number(r.totalAmount), 0);

      const occupancyRate =
        rooms.length > 0
          ? Math.round((checkedInCount / rooms.length) * 100)
          : 0;

      setStats({
        totalReservations: reservations.length,
        checkedIn: checkedInCount,
        availableRooms: availableRoomsCount,
        totalRooms: rooms.length,
        revenueToday: todayRevenue,
        occupancyRate,
      });

      setRecentReservations(reservations.slice(0, 5));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('dashboard.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  const statCards: StatCardItem[] = [
    {
      name: t('dashboard.stats.totalReservations'),
      value: stats.totalReservations.toString(),
      icon: Calendar,
      change: formatMessage('dashboard.stats.occupancyChange', {
        rate: stats.occupancyRate,
      }),
      changeType:
        stats.occupancyRate >= 70
          ? ('positive' as const)
          : ('negative' as const),
      tone: 'blue',
    },
    {
      name: t('dashboard.stats.checkedIn'),
      value: stats.checkedIn.toString(),
      icon: Users,
      change: formatMessage('dashboard.stats.availableChange', {
        count: stats.totalRooms - stats.checkedIn,
      }),
      changeType: 'neutral' as const,
      tone: 'orange',
    },
    {
      name: t('dashboard.stats.availableRooms'),
      value: stats.availableRooms.toString(),
      icon: Bed,
      change: formatMessage('dashboard.stats.ofTotal', {
        total: stats.totalRooms,
      }),
      changeType: 'neutral' as const,
      tone: 'sky',
    },
    {
      name: t('dashboard.stats.revenueToday'),
      value: `฿${stats.revenueToday.toLocaleString()}`,
      icon: CreditCard,
      change: t('dashboard.stats.todaysCheckIns'),
      changeType:
        stats.revenueToday > 0 ? ('positive' as const) : ('neutral' as const),
      tone: 'blueDark',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl md:space-y-8 mx-auto space-y-6">
      <div className="bg-white border border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 rounded-xl sm:p-6">
        <div className="min-w-0">
          <h1 className="font-bold sm:text-4xl text-3xl text-pura-blue tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            {formatMessage('dashboard.welcome', {
              name: t('dashboard.adminName'),
            })}
          </p>
        </div>
        <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            className="min-h-11 sm:w-auto w-full"
            onClick={() => router.push('/reservations/new')}
          >
            <Calendar className="h-4 mr-2 w-4" />
            {t('dashboard.newReservation')}
          </Button>
          <div className="bg-slate-50 border border-slate-200 flex gap-2 items-center justify-center min-h-11 px-4 py-2.5 rounded-lg sm:w-auto w-full">
            <TrendingUp className="h-5 text-emerald-600 w-5" />
            <span className="font-semibold text-slate-600 text-sm whitespace-nowrap">
              {formatMessage('dashboard.occupancy', {
                rate: stats.occupancyRate,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="gap-4 grid grid-cols-1 lg:grid-cols-4 md:gap-6 md:grid-cols-2">
        {statCards.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-xl sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-2xl text-pura-blue">
            {t('dashboard.recentReservations')}
          </h2>
          <Clock className="h-5 text-slate-400 w-5" />
        </div>

        {recentReservations.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            {t('dashboard.noRecentReservations')}
          </p>
        ) : (
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <RecentReservationRow
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
