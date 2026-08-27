'use client';

import type { ReactNode } from 'react';
import { Clock, FileText, MoonStar } from 'lucide-react';
import { t } from '@/lib/i18n';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';

const LINK_CARD_CLASS =
  'block border border-rule-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:border-rule-strong p-4 rounded-lg transition-colors';

interface SettingsLinkProps {
  readonly href: string;
  readonly label: string;
  readonly hint: string;
  readonly icon?: ReactNode;
}

function SettingsLink({ href, label, hint, icon }: SettingsLinkProps) {
  return (
    <Link href={href} className={LINK_CARD_CLASS}>
      <p className="flex font-semibold gap-2 items-center text-pura-blue">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-ink-subtle text-sm">{hint}</p>
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <Panel>
        <LocaleSwitcher />
      </Panel>

      <Panel title={t('settings.dayClose')}>
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
          <SettingsLink
            href="/night-audit"
            label={t('settings.nightAudit')}
            hint={t('settings.nightAuditHint')}
            icon={<MoonStar className="h-4 w-4" aria-hidden="true" />}
          />
          <SettingsLink
            href="/shifts"
            label={t('settings.shifts')}
            hint={t('settings.shiftsHint')}
            icon={<Clock className="h-4 w-4" aria-hidden="true" />}
          />
          <SettingsLink
            href="/reports"
            label={t('settings.reports')}
            hint={t('settings.reportsHint')}
            icon={<FileText className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
      </Panel>

      <Panel title={t('settings.masterData')}>
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
          <SettingsLink
            href="/settings/transaction-codes"
            label={t('settings.transactionCodes')}
            hint={t('settings.transactionCodesHint')}
          />
        </div>
      </Panel>
    </div>
  );
}
