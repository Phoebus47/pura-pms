import { Calendar, Users, Bed, CreditCard } from "lucide-react";

const stats = [
  {
    name: "Total Reservations",
    value: "124",
    icon: Calendar,
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    name: "Checked In",
    value: "87",
    icon: Users,
    change: "+8%",
    changeType: "positive" as const,
  },
  {
    name: "Available Rooms",
    value: "23",
    icon: Bed,
    change: "-5%",
    changeType: "negative" as const,
  },
  {
    name: "Revenue Today",
    value: "฿45,231",
    icon: CreditCard,
    change: "+23%",
    changeType: "positive" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">New Reservation</p>
              <p className="text-sm text-muted-foreground">
                Create a new booking
              </p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Check In</p>
              <p className="text-sm text-muted-foreground">Check in a guest</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Process Payment</p>
              <p className="text-sm text-muted-foreground">Handle billing</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
