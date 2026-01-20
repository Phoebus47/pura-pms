"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/40 bg-white/30 px-6 backdrop-blur-2xl sticky top-0 z-20 shadow-lg shadow-black/5">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#1e4b8e] transition-colors" />
          <input
            type="search"
            placeholder="Search guests, reservations, rooms..."
            className="w-full rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-[#1e4b8e]/40 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#1e4b8e]/10 placeholder:text-slate-500 shadow-lg shadow-black/5 hover:shadow-xl hover:bg-white/70"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted/80 rounded-full transition-all active:scale-95 group"
        >
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-[#1e4b8e] transition-colors" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#f5a623] ring-2 ring-white animate-pulse" />
        </Button>

        <div className="h-8 w-px bg-border/60 mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-3 hover:bg-muted/80 px-2 py-1.5 h-auto rounded-full transition-all active:scale-95 group"
            >
              <div className="relative">
                <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-[#1e4b8e]/20 transition-all">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-linear-to-br from-[#1e4b8e] to-[#153a6e] text-white font-semibold text-xs shadow-inner">
                    SA
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Super Admin
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Hotel Manager
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 p-2 rounded-2xl shadow-2xl border-border/50"
          >
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">
                  Super Admin
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@pura.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="rounded-xl cursor-pointer p-2.5 my-0.5 transition-colors focus:bg-[#1e4b8e]/5 focus:text-[#1e4b8e] font-medium">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer p-2.5 my-0.5 transition-colors focus:bg-[#1e4b8e]/5 focus:text-[#1e4b8e] font-medium">
              Switch Property
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="rounded-xl cursor-pointer p-2.5 my-0.5 text-red-600 focus:bg-red-50 focus:text-red-600 font-semibold">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
