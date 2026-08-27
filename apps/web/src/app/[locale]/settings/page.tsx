'use client';

import { Clock, FileText, MoonStar, Settings } from 'lucide-react';
import { t } from '@/lib/i18n';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-pura-blue">
            {t('settings.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="bg-surface-desk border border-rule-mist p-6 rounded-xl">
        <LocaleSwitcher />
      </div>

      <div className="bg-surface-desk border border-rule-mist p-6 rounded-xl">
        <div className="flex gap-3 items-center">
          <Clock className="h-6 text-muted-foreground w-6" aria-hidden="true" />
          <h2 className="font-semibold text-foreground text-xl">
            {t('settings.dayClose')}
          </h2>
        </div>

        <div className="gap-4 grid grid-cols-1 mt-6 sm:grid-cols-2">
          <Link
            href="/night-audit"
            className="bg-surface-desk border border-rule-mist hover:border-slate-300 p-5 rounded-xl shadow-sm transition-colors"
          >
            <p className="flex font-semibold gap-2 items-center text-pura-blue">
              <MoonStar className="h-4 w-4" aria-hidden="true" />
              {t('settings.nightAudit')}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {t('settings.nightAuditHint')}
            </p>
          </Link>
          <Link
            href="/shifts"
            className="bg-surface-desk border border-rule-mist hover:border-slate-300 p-5 rounded-xl shadow-sm transition-colors"
          >
            <p className="flex font-semibold gap-2 items-center text-pura-blue">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {t('settings.shifts')}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {t('settings.shiftsHint')}
            </p>
          </Link>
          <Link
            href="/reports"
            className="bg-surface-desk border border-rule-mist hover:border-slate-300 p-5 rounded-xl shadow-sm transition-colors"
          >
            <p className="flex font-semibold gap-2 items-center text-pura-blue">
              <FileText className="h-4 w-4" aria-hidden="true" />
              {t('settings.reports')}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {t('settings.reportsHint')}
            </p>
          </Link>
        </div>
      </div>

      <div className="bg-surface-desk border border-rule-mist p-6 rounded-xl">
        <div className="flex gap-3 items-center">
          <Settings
            className="h-6 text-muted-foreground w-6"
            aria-hidden="true"
          />
          <h2 className="font-semibold text-foreground text-xl">
            {t('settings.masterData')}
          </h2>
        </div>

        <div className="gap-4 grid grid-cols-1 mt-6 sm:grid-cols-2">
          <Link
            href="/settings/transaction-codes"
            className="bg-surface-desk border border-rule-mist hover:border-slate-300 p-5 rounded-xl shadow-sm transition-colors"
          >
            <p className="font-semibold text-pura-blue">
              {t('settings.transactionCodes')}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {t('settings.transactionCodesHint')}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
