'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">Settings</h1>
          <p className="mt-1 text-slate-600">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="backdrop-blur-2xl bg-white/40 border border-white/60 p-6 rounded-3xl shadow-2xl shadow-black/5">
        <div className="flex gap-3 items-center">
          <Settings className="h-6 text-slate-500 w-6" />
          <h2 className="font-semibold text-slate-700 text-xl">Master Data</h2>
        </div>

        <div className="gap-4 grid grid-cols-1 mt-6 sm:grid-cols-2">
          <Link
            href="/settings/transaction-codes"
            className="bg-white/60 border border-white/70 hover:bg-white/80 p-5 rounded-2xl shadow-sm transition-colors"
          >
            <p className="font-semibold text-[#1e4b8e]">Transaction Codes</p>
            <p className="mt-1 text-slate-600 text-sm">
              Chart of accounts mapping used for posting (tax/service/GL).
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
