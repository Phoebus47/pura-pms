import { Calendar, Users, Bed, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const stats = [
  {
    name: "Total Reservations",
    value: "124",
    icon: Calendar,
    change: "+12%",
    changeType: "positive" as const,
    color: "#1e4b8e",
  },
  {
    name: "Checked In",
    value: "87",
    icon: Users,
    change: "+8%",
    changeType: "positive" as const,
    color: "#f5a623",
  },
  {
    name: "Available Rooms",
    value: "23",
    icon: Bed,
    change: "-5%",
    changeType: "negative" as const,
    color: "#3b82f6",
  },
  {
    name: "Revenue Today",
    value: "฿45,231",
    icon: CreditCard,
    change: "+23%",
    changeType: "positive" as const,
    color: "#153a6e",
  },
];

export default function Dashboard() {
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
            <span className="text-[#1e4b8e] font-bold">Admin</span>! Here's your
            property overview.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/60 shadow-xl shadow-black/5">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-9 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-md"
              >
                <Avatar className="h-full w-full">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
          <span className="text-sm text-slate-600 font-semibold">
            5 staff on shift
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 hover:border-white/70 hover:bg-white/50"
          >
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-30"
              style={{ backgroundColor: stat.color }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-2xl p-3.5 shadow-2xl backdrop-blur-sm border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl"
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
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ring-1 ring-inset",
                  stat.changeType === "positive"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                    : "bg-rose-50 text-rose-700 ring-rose-600/20",
                )}
              >
                {stat.change}
              </div>
            </div>
            <div className="relative mt-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {stat.name}
              </p>
              <div className="flex items-baseline gap-1 mt-2">
                <p className="text-4xl font-bold text-slate-800 tracking-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-1 w-10 rounded-full bg-linear-to-r from-[#f5a623] to-[#fbbf24]" />
            <h2 className="text-2xl font-bold text-slate-800">
              Quick Actions
            </h2>
          </div>
          <div className="grid gap-4">
            <button className="flex items-center gap-4 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-5 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-[#1e4b8e]/10 hover:border-[#1e4b8e]/30 hover:-translate-y-1 hover:bg-white/50 group active:scale-[0.97]">
              <div className="rounded-2xl bg-[#1e4b8e]/90 backdrop-blur-sm border border-white/20 p-3 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:bg-[#1e4b8e]">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base text-slate-800">New Reservation</p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Create a new booking
                </p>
              </div>
            </button>
            <button className="flex items-center gap-4 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-5 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-[#f5a623]/10 hover:border-[#f5a623]/30 hover:-translate-y-1 hover:bg-white/50 group active:scale-[0.97]">
              <div className="rounded-2xl bg-[#f5a623]/90 backdrop-blur-sm border border-white/20 p-3 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:bg-[#f5a623]">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base text-slate-800">Check In</p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Handle arrival process
                </p>
              </div>
            </button>
            <button className="flex items-center gap-4 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-5 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-[#153a6e]/10 hover:border-[#153a6e]/30 hover:-translate-y-1 hover:bg-white/50 group active:scale-[0.97]">
              <div className="rounded-2xl bg-[#153a6e]/90 backdrop-blur-sm border border-white/20 p-3 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:bg-[#153a6e]">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base text-slate-800">Process Payment</p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Review and close folio
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity Mockup */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-1 w-10 rounded-full bg-linear-to-r from-[#1e4b8e] to-[#3b82f6]" />
            <h2 className="text-2xl font-bold text-slate-800">
              Recent Activity
            </h2>
          </div>
          <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl shadow-2xl shadow-black/5 overflow-hidden hover:shadow-xl hover:border-white/70 transition-all duration-300">
            <div className="divide-y divide-slate-200/50">
              {[
                {
                  type: "check-in",
                  user: "John Doe",
                  room: "302",
                  time: "10 mins ago",
                  color: "#1e4b8e",
                },
                {
                  type: "payment",
                  user: "Sarah Smith",
                  amount: "฿5,200",
                  time: "25 mins ago",
                  color: "#f5a623",
                },
                {
                  type: "booking",
                  user: "Mike Ross",
                  status: "Confirmed",
                  time: "1 hour ago",
                  color: "#3b82f6",
                },
                {
                  type: "housekeeping",
                  room: "105",
                  status: "Cleaned",
                  time: "2 hours ago",
                  color: "#153a6e",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 hover:bg-white/50 backdrop-blur-sm transition-all duration-200 cursor-default group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-xl backdrop-blur-sm border border-white/30 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: `${activity.color}ee` }}
                    >
                      {activity.type[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold capitalize text-slate-800">
                        {activity.type.replace("-", " ")}
                      </p>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {activity.user || `Room ${activity.room}`} •{" "}
                        {activity.amount ||
                          activity.status ||
                          "Check-in successful"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
