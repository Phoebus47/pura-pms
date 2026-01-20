"use client";

import Image from "next/image";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex h-full w-64 flex-col relative backdrop-blur-2xl text-white shadow-2xl border-r border-white/20 overflow-hidden z-20">
      {/* Glass Background with Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#1e4b8e]/90 via-[#1a4280]/85 to-[#153a6e]/90" />
      <div className="absolute inset-0 backdrop-blur-xl" />
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-white/20 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/pura-icon.svg"
              alt="PURA Logo"
              width={48}
              height={48}
              className="h-12 w-12 drop-shadow-2xl"
            />
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
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/95 text-[#1e4b8e] shadow-xl shadow-black/20 backdrop-blur-xl"
                  : "text-white/90 hover:bg-white/15 hover:text-white hover:shadow-lg hover:shadow-white/10 active:scale-95 backdrop-blur-sm",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive
                    ? "text-[#f5a623]"
                    : "text-white/70 group-hover:text-white group-hover:scale-110",
                )}
              />
              <span className={cn("font-medium", isActive && "font-semibold")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

        {/* Footer */}
        <div className="border-t border-white/20 p-4">
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-xl border border-white/20 shadow-lg">
            <p className="text-xs font-semibold text-white/90">PURA PMS</p>
            <p className="text-[10px] text-white/60 mt-1">v1.0.0 • Enterprise</p>
          </div>
        </div>
      </div>
    </div>
  );
}
