'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/config/navigation';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="backdrop-blur-2xl border-r border-white/20 flex-col h-full hidden md:flex overflow-hidden relative shadow-2xl text-white w-64 z-20">
      <div className="absolute bg-linear-to-b from-[#1e4b8e]/90 inset-0 to-[#153a6e]/90 via-[#1a4280]/85" />
      <div className="absolute backdrop-blur-xl inset-0" />

      <div className="flex flex-col h-full relative z-10">
        <div className="backdrop-blur-sm border-b border-white/20 flex h-20 items-center justify-center px-6">
          <div className="flex gap-3 items-center">
            <Image
              src="/pura-icon.svg"
              alt="PURA Logo"
              width={48}
              height={48}
              className="drop-shadow-2xl h-12 w-12"
              loading="eager"
              priority
            />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/95 text-[#1e4b8e] shadow-xl shadow-black/20 backdrop-blur-xl'
                    : 'text-white/90 hover:bg-white/15 hover:text-white hover:shadow-lg hover:shadow-white/10 active:scale-95 backdrop-blur-sm',
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive
                      ? 'text-[#f5a623]'
                      : 'text-white/70 group-hover:text-white group-hover:scale-110',
                  )}
                />
                <span
                  className={cn('font-medium', isActive && 'font-semibold')}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/20 p-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-2xl shadow-lg text-center">
            <p className="font-semibold text-white/90 text-xs">PURA PMS</p>
            <p className="mt-1 text-[10px] text-white/60">
              v1.0.0 • Enterprise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
