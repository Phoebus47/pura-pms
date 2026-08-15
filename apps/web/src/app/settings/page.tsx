'use client';

import Link from 'next/link';
import { Clock, FileText, MoonStar, Settings } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">
            {t('settings.title')}
          </h1>
          <p className="mt-1 text-slate-600">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="backdrop-blur-2xl bg-white/40 border border-white/60 p-6 rounded-3xl shadow-2xl shadow-black/5">
        <div className="flex gap-3 items-center">
          <Clock className="h-6 text-slate-500 w-6" aria-hidden="true" />
          <h2 className="font-semibold text-slate-700 text-xl">
            {t('settings.dayClose')}
          </h2>
        </div>

        <div className="gap-4 grid grid-cols-1 mt-6 sm:grid-cols-2">
          <Link
            href="/night-audit"
            className="bg-white/60 border border-white/70 hover:bg-white/80 p-5 rounded-2xl shadow-sm transition-colors"
          >
            <p className="flex font-semibold gap-2 items-center text-[#1e4b8e]">
              <MoonStar className="h-4 w-4" aria-hidden="true" />
              {t('settings.nightAudit')}
            </p>
            <p className="mt-1 text-slate-600 text-sm">
              {t('settings.nightAuditHint')}
            </p>
          </Link>
          <Link
            href="/shifts"
            className="bg-white/60 border border-white/70 hover:bg-white/80 p-5 rounded-2xl shadow-sm transition-colors"
          >
            <p className="flex font-semibold gap-2 items-center text-[#1e4b8e]">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {t('settings.shifts')}
            </p>
            <p className="mt-1 text-slate-600 text-sm">
              {t('settings.shiftsHint')}
            </p>
          </Link>
          <Link
            href="/reports"
            className="bg-white/60 border border-white/70 hover:bg-white/80 p-5 rounded-2xl shadow-sm transition-colors"
          >
            <p className="flex font-semibold gap-2 items-center text-[#1e4b8e]">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {t('settings.reports')}
            </p>
            <p className="mt-1 text-slate-600 text-sm">
              {t('settings.reportsHint')}
            </p>
          </Link>
        </div>
      </div>

      <div className="backdrop-blur-2xl bg-white/40 border border-white/60 p-6 rounded-3xl shadow-2xl shadow-black/5">
        <div className="flex gap-3 items-center">
          <Settings className="h-6 text-slate-500 w-6" aria-hidden="true" />
          <h2 className="font-semibold text-slate-700 text-xl">
            {t('settings.masterData')}
          </h2>
        </div>

        <div className="gap-4 grid grid-cols-1 mt-6 sm:grid-cols-2">
          <Link
            href="/settings/transaction-codes"
            className="bg-white/60 border border-white/70 hover:bg-white/80 p-5 rounded-2xl shadow-sm transition-colors"
          >
            <p className="font-semibold text-[#1e4b8e]">
              {t('settings.transactionCodes')}
            </p>
            <p className="mt-1 text-slate-600 text-sm">
              {t('settings.transactionCodesHint')}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
