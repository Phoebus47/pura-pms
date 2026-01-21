'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute bg-linear-to-br from-blue-50 inset-0 opacity-60 to-orange-50 via-indigo-50" />
      <div className="absolute bg-pattern inset-0" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
