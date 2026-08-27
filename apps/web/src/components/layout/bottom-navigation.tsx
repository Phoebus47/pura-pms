'use client';

import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moreBottomNavItems, primaryBottomNavItems } from '@/config/navigation';
import { t } from '@/lib/i18n';
import { Link, usePathname } from '@/i18n/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TAB_CLASS =
  'flex flex-1 flex-col items-center justify-center gap-1 max-w-none min-h-11 min-w-11 px-1 py-2 transition-colors';

export function BottomNavigation() {
  const pathname = usePathname();
  const isMoreActive = moreBottomNavItems.some(
    (item) => pathname === item.href,
  );

  return (
    <nav className="bg-surface-desk border-rule-mist border-t bottom-0 fixed left-0 lg:hidden pb-[env(safe-area-inset-bottom)] right-0 z-50">
      <div className="flex h-16 items-center justify-around">
        {primaryBottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                TAB_CLASS,
                isActive
                  ? 'text-pura-blue'
                  : 'text-muted-foreground hover:text-pura-blue',
              )}
              aria-label={t(item.labelKey)}
            >
              <item.icon className="h-5 w-5" />
              <span
                className={cn(
                  'max-w-full text-[10px] font-medium truncate',
                  isActive && 'font-semibold',
                )}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('nav.more')}
              className={cn(
                TAB_CLASS,
                isMoreActive
                  ? 'text-pura-blue'
                  : 'text-muted-foreground hover:text-pura-blue',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span
                className={cn(
                  'max-w-full text-[10px] font-medium truncate',
                  isMoreActive && 'font-semibold',
                )}
              >
                {t('nav.more')}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end">
            {moreBottomNavItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="min-h-11">
                  <item.icon />
                  {t(item.labelKey)}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
