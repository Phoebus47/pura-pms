'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

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
  if (!isOpen) return null;

  const maxWidthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="backdrop-blur-sm bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div
        className={`bg-white max-h-[90vh] ${maxWidthClasses[maxWidth]} overflow-hidden rounded-3xl shadow-2xl w-full`}
      >
        {/* Header */}
        <div className="border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="font-bold text-[#1e4b8e] text-2xl">{title}</h2>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 p-2 rounded-xl transition-colors"
            aria-label="Close dialog"
            type="button"
          >
            <X className="h-5 text-slate-600 w-5" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
