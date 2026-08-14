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
        error instanceof Error
          ? error.message
          : 'Failed to load dashboard data',
      );
    } finally {
      setLoading(false);
    }
  }

  const statCards: StatCardItem[] = [
    {
      name: 'Total Reservations',
      value: stats.totalReservations.toString(),
      icon: Calendar,
      change: `${stats.occupancyRate}% occupancy`,
      changeType:
        stats.occupancyRate >= 70
          ? ('positive' as const)
          : ('negative' as const),
      tone: 'blue',
    },
    {
      name: 'Checked In',
      value: stats.checkedIn.toString(),
      icon: Users,
      change: `${stats.totalRooms - stats.checkedIn} available`,
      changeType: 'neutral' as const,
      tone: 'orange',
    },
    {
      name: 'Available Rooms',
      value: stats.availableRooms.toString(),
      icon: Bed,
      change: `of ${stats.totalRooms} total`,
      changeType: 'neutral' as const,
      tone: 'sky',
    },
    {
      name: 'Revenue Today',
      value: `฿${stats.revenueToday.toLocaleString()}`,
      icon: CreditCard,
      change: "Today's check-ins",
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
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in duration-500 fade-in max-w-7xl md:space-y-8 mx-auto space-y-6">
      <div className="backdrop-blur-2xl bg-white/40 border border-white/60 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 rounded-3xl shadow-2xl shadow-black/5 sm:p-6">
        <div className="min-w-0">
          <h1 className="font-bold sm:text-4xl text-3xl text-pura-blue tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Welcome back,{' '}
            <span className="font-bold text-pura-blue">Admin</span>! Here&apos;s
            your property overview.
          </p>
        </div>
        <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            className="bg-pura-blue hover:bg-pura-blue-dark min-h-11 rounded-xl shadow-blue-900/10 shadow-lg sm:w-auto w-full"
            onClick={() => router.push('/reservations/new')}
          >
            <Calendar className="h-4 mr-2 w-4" />
            New Reservation
          </Button>
          <div className="backdrop-blur-xl bg-white/50 border border-white/60 flex gap-2 items-center justify-center min-h-11 px-4 py-2.5 rounded-xl shadow-black/5 shadow-lg sm:w-auto w-full">
            <TrendingUp className="h-5 text-emerald-600 w-5" />
            <span className="font-semibold text-slate-600 text-sm whitespace-nowrap">
              {stats.occupancyRate}% Occupancy
            </span>
          </div>
        </div>
      </div>

      <div className="gap-4 grid grid-cols-1 lg:grid-cols-4 md:gap-6 md:grid-cols-2">
        {statCards.map((stat) => (
          <StatCard key={stat.name} stat={stat} />
        ))}
      </div>

      <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-4 rounded-3xl shadow-xl sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-2xl text-pura-blue">
            Recent Reservations
          </h2>
          <Clock className="h-5 text-slate-400 w-5" />
        </div>

        {recentReservations.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No recent reservations
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
