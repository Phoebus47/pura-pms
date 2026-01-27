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
    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
      <h3 className="font-semibold text-red-800">{title}</h3>
      <p className="mt-2 text-red-600">{message}</p>
      <Button onClick={handleBack} className="mt-4">
        Go Back
      </Button>
    </div>
  );
}
