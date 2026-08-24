'use client';

import { setActiveMessages } from '@/lib/i18n';
import type { AppLocale } from '@/i18n/routing';
import type en from '@/messages/en.json';

type Messages = typeof en;
type MessageTree = {
  readonly [key: string]: string | Messages[keyof Messages];
};

interface I18nProviderProps {
  readonly locale: string;
  readonly messages: Messages;
  readonly children: React.ReactNode;
}

export function I18nProvider({
  locale,
  messages,
  children,
}: I18nProviderProps) {
  setActiveMessages(messages as MessageTree, locale as AppLocale);

  return (
    <span data-locale={locale} className="contents">
      {children}
    </span>
  );
}
