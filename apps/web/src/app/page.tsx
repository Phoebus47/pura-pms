"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Bed,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { reservationsAPI, roomsAPI, type Reservation } from "@/lib/api";

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

      // Fetch all data in parallel
      const [reservations, rooms] = await Promise.all([
        reservationsAPI.getAll(),
        roomsAPI.getAll(),
      ]);

      // Calculate stats
      const checkedInCount = reservations.filter(
        (r) => r.status === "CHECKED_IN",
      ).length;
      const availableRoomsCount = rooms.filter(
        (r) => r.status === "VACANT_CLEAN" || r.status === "VACANT_DIRTY",
      ).length;

      // Calculate today's revenue (from checked-in reservations)
      const today = new Date().toISOString().split("T")[0];
      const todayRevenue = reservations
        .filter((r) => r.status === "CHECKED_IN" && r.checkIn.startsWith(today))
        .reduce((sum, r) => sum + Number(r.totalAmount), 0);

      // Calculate occupancy rate
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

      // Get recent reservations (last 5)
      setRecentReservations(reservations.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      name: "Total Reservations",
      value: stats.totalReservations.toString(),
      icon: Calendar,
      change: `${stats.occupancyRate}% occupancy`,
      changeType:
        stats.occupancyRate >= 70 ? "positive" : ("negative" as const),
      color: "#1e4b8e",
    },
    {
      name: "Checked In",
      value: stats.checkedIn.toString(),
      icon: Users,
      change: `${stats.totalRooms - stats.checkedIn} available`,
      changeType: "neutral" as const,
      color: "#f5a623",
    },
    {
      name: "Available Rooms",
      value: stats.availableRooms.toString(),
      icon: Bed,
      change: `of ${stats.totalRooms} total`,
      changeType: "neutral" as const,
      color: "#3b82f6",
    },
    {
      name: "Revenue Today",
      value: `฿${stats.revenueToday.toLocaleString()}`,
      icon: CreditCard,
      change: "Today's check-ins",
      changeType: stats.revenueToday > 0 ? "positive" : ("neutral" as const),
      color: "#153a6e",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/40 backdrop-blur-2xl rounded-3xl p-6 border border-white/60 shadow-2xl shadow-black/5">
        <div>
          <h1 className="text-4xl font-bold text-[#1e4b8e] tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-base">
            Welcome back,{" "}
            <span className="text-[#1e4b8e] font-bold">Admin</span>! Here&apos;s
            your property overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e] shadow-lg shadow-blue-900/10"
            onClick={() => router.push("/reservations/new")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/60 shadow-lg shadow-black/5">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-slate-600 font-semibold">
              {stats.occupancyRate}% Occupancy
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 hover:border-white/70 hover:bg-white/50"
          >
            <div
              className="absolute -right-4 -top-4 h-32 w-32 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30"
              style={{ backgroundColor: stat.color }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-2xl p-3.5 shadow-2xl backdrop-blur-sm border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl"
                  style={{
                    backgroundColor: `${stat.color}ee`,
                    color: "white",
                  }}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ring-1 ring-inset",
                  stat.changeType === "positive"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                    : stat.changeType === "negative"
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-slate-50 text-slate-700 ring-slate-600/20",
                )}
              >
                {stat.change}
              </div>
            </div>
            <div className="relative mt-4">
              <p className="text-sm font-semibold text-slate-600">
                {stat.name}
              </p>
              <p className="mt-2 text-4xl font-black tracking-tight text-[#1e4b8e]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1e4b8e]">
            Recent Reservations
          </h2>
          <Clock className="h-5 w-5 text-slate-400" />
        </div>

        {recentReservations.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            No recent reservations
          </p>
        ) : (
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/50 hover:bg-white/70 transition-colors border border-white/60"
              >
                <div className="flex items-center gap-4">
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
                      {reservation.guest?.firstName}{" "}
                      {reservation.guest?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">
                      Room {reservation.room?.number} •{" "}
                      {reservation.confirmNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1e4b8e]">
                    ฿{Number(reservation.totalAmount).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(reservation.checkIn).toLocaleDateString()} -{" "}
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
