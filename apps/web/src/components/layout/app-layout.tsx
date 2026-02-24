'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { BottomNavigation } from './bottom-navigation';

export function AppLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div className="absolute bg-linear-to-br from-blue-50 inset-0 opacity-60 to-orange-50 via-indigo-50" />
      <div className="absolute bg-pattern inset-0" />

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 md:p-8 md:pb-8 overflow-y-auto p-4 pb-20">
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
