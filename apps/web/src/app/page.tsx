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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { reservationsAPI, roomsAPI, type Reservation } from '@/lib/api';
import { toast } from '@/lib/toast';

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

  const statCards = [
    {
      name: 'Total Reservations',
      value: stats.totalReservations.toString(),
      icon: Calendar,
      change: `${stats.occupancyRate}% occupancy`,
      changeType:
        stats.occupancyRate >= 70 ? 'positive' : ('negative' as const),
      color: '#1e4b8e',
    },
    {
      name: 'Checked In',
      value: stats.checkedIn.toString(),
      icon: Users,
      change: `${stats.totalRooms - stats.checkedIn} available`,
      changeType: 'neutral' as const,
      color: '#f5a623',
    },
    {
      name: 'Available Rooms',
      value: stats.availableRooms.toString(),
      icon: Bed,
      change: `of ${stats.totalRooms} total`,
      changeType: 'neutral' as const,
      color: '#3b82f6',
    },
    {
      name: 'Revenue Today',
      value: `฿${stats.revenueToday.toLocaleString()}`,
      icon: CreditCard,
      change: "Today's check-ins",
      changeType: stats.revenueToday > 0 ? 'positive' : ('neutral' as const),
      color: '#153a6e',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in duration-500 fade-in max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="backdrop-blur-2xl bg-white/40 border border-white/60 flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 rounded-3xl shadow-2xl shadow-black/5">
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-4xl tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Welcome back,{' '}
            <span className="font-bold text-[#1e4b8e]">Admin</span>! Here&apos;s
            your property overview.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Button
            className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl shadow-blue-900/10 shadow-lg"
            onClick={() => router.push('/reservations/new')}
          >
            <Calendar className="h-4 mr-2 w-4" />
            New Reservation
          </Button>
          <div className="backdrop-blur-xl bg-white/50 border border-white/60 flex gap-2 items-center px-4 py-2.5 rounded-xl shadow-black/5 shadow-lg">
            <TrendingUp className="h-5 text-emerald-600 w-5" />
            <span className="font-semibold text-slate-600 text-sm">
              {stats.occupancyRate}% Occupancy
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="gap-6 grid lg:grid-cols-4 md:grid-cols-2">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="backdrop-blur-2xl bg-white/40 border border-white/50 duration-300 group hover:-translate-y-2 hover:bg-white/50 hover:border-white/70 hover:shadow-2xl hover:shadow-black/10 overflow-hidden p-6 relative rounded-3xl shadow-black/5 shadow-xl transition-all"
          >
            <div
              className="-right-4 -top-4 absolute blur-2xl duration-500 group-hover:opacity-30 group-hover:scale-150 h-32 opacity-20 rounded-full transition-all w-32"
              style={{ backgroundColor: stat.color }}
            />
            <div className="flex items-center justify-between relative">
              <div className="flex gap-3 items-center">
                <div
                  className="backdrop-blur-sm border border-white/30 duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-xl p-3.5 rounded-2xl shadow-2xl transition-all"
                  style={{
                    backgroundColor: `${stat.color}ee`,
                    color: 'white',
                  }}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ring-1 ring-inset',
                  stat.changeType === 'positive'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    : stat.changeType === 'negative'
                      ? 'bg-red-50 text-red-700 ring-red-600/20'
                      : 'bg-slate-50 text-slate-700 ring-slate-600/20',
                )}
              >
                {stat.change}
              </div>
            </div>
            <div className="mt-4 relative">
              <p className="font-semibold text-slate-600 text-sm">
                {stat.name}
              </p>
              <p className="font-black mt-2 text-[#1e4b8e] text-4xl tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-[#1e4b8e] text-2xl">
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
              <div
                key={reservation.id}
                className="bg-white/50 border border-white/60 flex hover:bg-white/70 items-center justify-between p-4 rounded-2xl transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${reservation.guest?.firstName}+${reservation.guest?.lastName}`}
                    />
                    <AvatarFallback>
                      {reservation.guest?.firstName?.[0]}
                      {reservation.guest?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {reservation.guest?.firstName}{' '}
                      {reservation.guest?.lastName}
                    </p>
                    <p className="text-slate-500 text-sm">
                      Room {reservation.room?.number} •{' '}
                      {reservation.confirmNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1e4b8e]">
                    ฿{Number(reservation.totalAmount).toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {new Date(reservation.checkIn).toLocaleDateString()} -{' '}
                    {new Date(reservation.checkOut).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
