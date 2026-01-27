'use client';

interface ErrorDisplayProps {
  readonly error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div
      className="bg-red-50 border border-red-200 p-4 rounded-xl"
      role="alert"
    >
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  );
}
