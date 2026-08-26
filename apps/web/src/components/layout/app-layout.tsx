'use client';

import { usePathname } from '@/i18n/navigation';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { BottomNavigation } from './bottom-navigation';

export function AppLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (
    pathname === '/login' ||
    pathname.startsWith('/mobile-check-in') ||
    pathname.startsWith('/portal')
  ) {
    return <>{children}</>;
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <OfflineBanner />
        <main className="flex-1 lg:p-8 lg:pb-8 overflow-y-auto p-4 pb-20">
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
