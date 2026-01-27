'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationItems } from '@/config/navigation';

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="backdrop-blur-xl bg-white/95 border-slate-200 border-t bottom-0 fixed left-0 md:hidden right-0 shadow-black/5 shadow-lg z-50">
      <div className="flex h-16 items-center justify-around">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[44px] px-3 py-2 transition-colors',
                isActive
                  ? 'text-[#1e4b8e]'
                  : 'text-slate-600 hover:text-[#1e4b8e] active:scale-95',
              )}
              aria-label={item.name}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-transform',
                  isActive && 'scale-110',
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isActive && 'font-semibold',
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
