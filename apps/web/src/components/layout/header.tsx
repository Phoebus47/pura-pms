'use client';

import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  return (
    <header className="backdrop-blur-2xl bg-white/30 border-b border-white/40 flex h-16 items-center justify-between px-6 shadow-black/5 shadow-lg sticky top-0 z-20">
      <div className="flex flex-1 gap-4 items-center">
        <div className="group max-w-md relative w-full">
          <Search className="-translate-y-1/2 absolute group-focus-within:text-[#1e4b8e] h-4 left-3.5 text-muted-foreground top-1/2 transition-colors w-4" />
          <input
            id="global-search"
            name="search"
            type="search"
            placeholder="Search guests, reservations, rooms..."
            aria-label="Search guests, reservations, rooms"
            className="backdrop-blur-xl bg-white/60 border border-white/60 focus:bg-white/80 focus:border-[#1e4b8e]/40 focus:outline-none focus:ring-[#1e4b8e]/10 focus:ring-4 hover:bg-white/70 hover:shadow-xl pl-10 placeholder:text-slate-500 pr-4 py-2.5 rounded-2xl shadow-black/5 shadow-lg text-sm transition-all w-full"
          />
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="active:scale-95 group hover:bg-muted/80 relative rounded-full transition-all"
        >
          <Bell className="group-hover:text-[#1e4b8e] h-5 text-muted-foreground transition-colors w-5" />
          <span
            className="absolute animate-pulse bg-[#f5a623] h-2 right-2 ring-2 ring-white rounded-full top-2 w-2"
            aria-hidden="true"
          />
        </Button>

        <div className="bg-border/60 h-8 mx-1 w-px" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="active:scale-95 gap-3 group h-auto hover:bg-muted/80 px-2 py-1.5 rounded-full transition-all"
            >
              <div className="relative">
                <Avatar className="border-2 border-transparent group-hover:border-[#1e4b8e]/20 h-9 transition-all w-9">
                  <AvatarImage
                    src="/placeholder-avatar.jpg"
                    alt="Super Admin profile picture"
                  />
                  <AvatarFallback className="bg-linear-to-br font-semibold from-[#1e4b8e] shadow-inner text-white text-xs to-[#153a6e]">
                    SA
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bg-emerald-500 border-2 border-white bottom-0 h-2.5 right-0 rounded-full w-2.5" />
              </div>
              <div className="hidden md:block text-left">
                <p className="font-semibold leading-tight text-foreground text-sm">
                  Super Admin
                </p>
                <p className="font-medium text-[11px] text-muted-foreground">
                  Hotel Manager
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-border/50 p-2 rounded-2xl shadow-2xl w-60"
          >
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="font-semibold leading-none text-sm">
                  Super Admin
                </p>
                <p className="leading-none text-muted-foreground text-xs">
                  admin@pura.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="cursor-pointer focus:bg-[#1e4b8e]/5 focus:text-[#1e4b8e] font-medium my-0.5 p-2.5 rounded-xl transition-colors">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-[#1e4b8e]/5 focus:text-[#1e4b8e] font-medium my-0.5 p-2.5 rounded-xl transition-colors">
              Switch Property
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="cursor-pointer focus:bg-red-50 focus:text-red-600 font-semibold my-0.5 p-2.5 rounded-xl text-red-600">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
