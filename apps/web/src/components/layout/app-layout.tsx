"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-orange-50 opacity-60" />
      <div className="absolute inset-0 bg-pattern" />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
