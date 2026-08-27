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
        <div
          className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"
          aria-hidden="true"
        />
        <p className="mt-4 text-ink-subtle">{message}</p>
      </div>
    </div>
  );
}
