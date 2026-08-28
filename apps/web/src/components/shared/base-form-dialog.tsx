'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { t } from '@/lib/i18n';

interface BaseFormDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly maxWidth?: 'md' | 'lg' | 'xl' | '2xl';
}

export function BaseFormDialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '2xl',
}: BaseFormDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div
        className={`bg-surface-desk max-h-[90vh] ${maxWidthClasses[maxWidth]} overflow-hidden rounded-xl shadow-lg w-full`}
      >
        <div className="border-b border-rule-mist flex items-center justify-between p-6">
          <h2 className="font-bold text-2xl text-pura-blue">{title}</h2>
          <button
            onClick={onClose}
            className="hover:bg-muted p-2 rounded-xl transition-colors"
            aria-label={t('common.closeDialog')}
            type="button"
          >
            <X className="h-5 text-muted-foreground w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
