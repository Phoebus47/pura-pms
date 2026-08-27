'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clearAuthToken } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertySwitcher } from '@/components/property-switcher';

export function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  function handleLogout() {
    clearAuthToken();
    clearAuth();
    router.push('/login');
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      return;
    }
    router.push(`/guests?q=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
  }

  const userName = user?.name || 'Guest User';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const userRole =
    user?.role === 'ADMIN' ? 'Super Admin' : user?.role || 'Guest';
  const userEmail = user?.email || 'guest@pura.com';

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="bg-surface-desk border-b border-rule-mist flex h-14 items-center justify-between lg:h-16 lg:px-6 px-3 sticky top-0 z-20">
      <div className="flex flex-1 gap-2 items-center lg:gap-4 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open search"
          aria-expanded={isSearchOpen}
          aria-controls="global-search"
          onClick={() => setIsSearchOpen((open) => !open)}
          className="lg:hidden min-h-11 min-w-11 rounded-full"
        >
          <Search className="h-5 text-muted-foreground w-5" />
        </Button>
        <form
          onSubmit={handleSearchSubmit}
          className={cn(
            'group relative w-full max-w-md min-w-0',
            isSearchOpen ? 'block' : 'hidden lg:block',
          )}
        >
          <Search className="-translate-y-1/2 absolute group-focus-within:text-pura-blue h-4 left-3.5 pointer-events-none text-muted-foreground top-1/2 transition-colors w-4" />
          <Input
            ref={searchInputRef}
            id="global-search"
            name="search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('header.searchPlaceholder')}
            aria-label={t('header.searchLabel')}
            className="pl-10 pr-4 py-2.5 rounded-lg text-sm w-full"
          />
        </form>
      </div>

      <div className="flex gap-2 items-center lg:gap-3">
        <PropertySwitcher className="hidden md:flex" />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="group hover:bg-muted min-h-11 min-w-11 relative rounded-full"
        >
          <Bell className="group-hover:text-pura-blue h-5 text-muted-foreground transition-colors w-5" />
          <span
            className="absolute bg-pura-orange h-2 right-2 ring-2 ring-white rounded-full top-2 w-2"
            aria-hidden="true"
          />
        </Button>

        <div className="bg-rule-mist h-8 mx-1 w-px" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-3 group h-auto hover:bg-muted px-2 py-1.5 rounded-full"
            >
              <div className="relative">
                <Avatar className="border-2 border-transparent group-hover:border-pura-blue/20 h-9 transition-colors w-9">
                  <AvatarImage
                    src="/placeholder-avatar.jpg"
                    alt="Super Admin profile picture"
                  />
                  <AvatarFallback className="bg-pura-blue font-semibold text-white text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bg-status-positive-500 border-2 border-white bottom-0 h-2.5 right-0 rounded-full w-2.5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-semibold leading-tight text-foreground text-sm">
                  {userName}
                </p>
                <p className="font-medium text-[11px] text-muted-foreground">
                  {userRole}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-2 w-60">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="font-semibold leading-none text-sm">{userName}</p>
                <p className="leading-none text-muted-foreground text-xs">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem className="cursor-pointer focus:bg-pura-blue/5 focus:text-pura-blue font-medium my-0.5 p-2.5 rounded-md transition-colors">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-pura-blue/5 focus:text-pura-blue font-medium my-0.5 p-2.5 rounded-md transition-colors">
              Switch Property
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer focus:bg-status-critical-tint focus:text-status-critical-ink font-semibold my-0.5 p-2.5 rounded-md text-status-critical-ink"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
