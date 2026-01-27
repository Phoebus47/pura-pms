'use client';

interface LoadingSpinnerProps {
  readonly message?: string;
}

export function LoadingSpinner({
  message = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
        <p className="mt-4 text-slate-600">{message}</p>
      </div>
    </div>
  );
}
