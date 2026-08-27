'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface DetailPageErrorProps {
  readonly title: string;
  readonly message: string;
  readonly onBack?: () => void;
}

export function DetailPageError({
  title,
  message,
  onBack,
}: DetailPageErrorProps) {
  const router = useRouter();

  const handleBack = onBack || (() => router.back());

  return (
    <div className="bg-status-critical-tint border border-status-critical-line/30 p-6 rounded-lg">
      <h3 className="font-semibold text-status-critical-ink">{title}</h3>
      <p className="mt-2 text-status-critical-ink">{message}</p>
      <Button onClick={handleBack} className="mt-4">
        Go Back
      </Button>
    </div>
  );
}
