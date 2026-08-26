import en from '@/messages/en.json';
import th from '@/messages/th.json';
import type { AppLocale } from '@/i18n/routing';

type MessageTree = { readonly [key: string]: string | MessageTree };

const messagesByLocale: Record<AppLocale, MessageTree> = {
  en: en as MessageTree,
  th: th as MessageTree,
};

let activeMessages: MessageTree = messagesByLocale.en;
let activeLocale: AppLocale = 'en';

export function setActiveMessages(
  messages: MessageTree,
  locale: AppLocale = activeLocale,
): void {
  activeMessages = messages;
  activeLocale = locale;
}

export function setI18nLocale(locale: AppLocale): void {
  activeLocale = locale;
  activeMessages = messagesByLocale[locale];
}

export function getI18nLocale(): AppLocale {
  return activeLocale;
}

function resolveMessage(path: string, tree: MessageTree): string {
  const parts = path.split('.');
  let current: string | MessageTree = tree;

  for (const part of parts) {
    if (typeof current !== 'object' || !(part in current)) {
      return path;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : path;
}

export function t(path: string, locale?: AppLocale): string {
  const tree = locale ? messagesByLocale[locale] : activeMessages;
  return resolveMessage(path, tree);
}

export function formatMessage(
  path: string,
  vars: Record<string, string | number>,
  locale?: AppLocale,
): string {
  let message = t(path, locale);
  for (const [key, value] of Object.entries(vars)) {
    message = message.replaceAll(`{${key}}`, String(value));
  }
  return message;
}

export function getDateLocale(): string {
  return getI18nLocale() === 'th' ? 'th-TH' : 'en-US';
}

export function tWithMessages(path: string, messages: MessageTree): string {
  return resolveMessage(path, messages);
}

export function resetMessagesToDefault(): void {
  setI18nLocale('en');
}
