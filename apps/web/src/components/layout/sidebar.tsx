"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bed,
  CreditCard,
  FileText,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Reservations", href: "/reservations", icon: Calendar },
  { name: "Guests", href: "/guests", icon: Users },
  { name: "Rooms", href: "/rooms", icon: Bed },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-pura" />
          <span className="text-xl font-bold text-foreground">PURA</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          PURA PMS v1.0.0
        </p>
      </div>
    </div>
  );
}
