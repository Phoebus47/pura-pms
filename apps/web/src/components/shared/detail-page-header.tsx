'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailPageHeaderProps {
  readonly title: string;
  readonly subtitle?: string | ReactNode;
  readonly actions?: ReactNode;
  readonly onBack?: () => void;
}

export function DetailPageHeader({
  title,
  subtitle,
  actions,
  onBack,
}: DetailPageHeaderProps) {
  const router = useRouter();

  const handleBack = onBack || (() => router.back());

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4 items-center">
        <Button variant="outline" onClick={handleBack} className="rounded-xl">
          <ArrowLeft className="h-4 mr-2 w-4" />
          Back
        </Button>
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">{title}</h1>
          {subtitle && (
            <div className="mt-1">
              {typeof subtitle === 'string' ? (
                <p className="text-slate-600">{subtitle}</p>
              ) : (
                subtitle
              )}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
