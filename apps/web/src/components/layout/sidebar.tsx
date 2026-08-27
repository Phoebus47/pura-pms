'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { navigationGroups } from '@/config/navigation';
import { t } from '@/lib/i18n';
import { Link, usePathname } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-pura-blue flex-col h-full hidden lg:flex text-white w-64">
      <div className="border-b border-white/10 flex h-20 items-center justify-center px-6">
        <Image
          src="/pura-icon.svg"
          alt="PURA Logo"
          width={48}
          height={48}
          className="h-12 w-12"
          loading="eager"
          priority
        />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 scrollbar-sidebar space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            <p className="font-semibold pb-1 px-4 text-[10px] text-white/45 tracking-wider uppercase">
              {t(group.labelKey)}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-white text-pura-blue'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-pura-orange' : 'text-white/70',
                    )}
                  />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-4">
        <LocaleSwitcher appearance="onDark" className="[&_button]:min-h-9" />
        <ThemeToggle appearance="onDark" className="justify-center w-full" />
        <div>
          <p className="font-semibold text-white text-xs">PURA PMS</p>
          <p className="mt-1 text-[10px] text-white/60">v1.0.0 • Enterprise</p>
        </div>
      </div>
    </div>
  );
}
