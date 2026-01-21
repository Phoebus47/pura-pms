'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">Settings</h1>
          <p className="mt-1 text-slate-600">Manage your account and preferences</p>
        </div>
      </div>

      <div className="backdrop-blur-2xl bg-white/40 border border-white/60 flex flex-col items-center justify-center min-h-[400px] p-12 rounded-3xl shadow-2xl shadow-black/5">
        <Settings className="h-16 mb-4 text-slate-400 w-16" />
        <h2 className="font-semibold mb-2 text-slate-700 text-xl">
          Settings Coming Soon
        </h2>
        <p className="text-center text-slate-500 text-sm max-w-md">
          This feature is under development. You&apos;ll be able to manage your
          settings and preferences here.
        </p>
      </div>
    </div>
  );
}
