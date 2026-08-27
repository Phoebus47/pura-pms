import { getDateLocale } from '@/lib/i18n';

export function formatStayDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(getDateLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
