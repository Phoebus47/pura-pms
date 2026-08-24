import { t } from '@/lib/i18n';
import { PRINT_DOCUMENT_CLASS } from '@/lib/fonts.constants';
import { cn } from '@/lib/utils';

interface PrintDocumentProps {
  children: React.ReactNode;
  className?: string;
}

export function PrintDocument({ children, className }: PrintDocumentProps) {
  return (
    <article
      aria-label={t('print.documentLabel')}
      className={cn(
        PRINT_DOCUMENT_CLASS,
        'max-w-2xl mx-auto p-6 print:p-0 space-y-6',
        className,
      )}
    >
      {children}
    </article>
  );
}
