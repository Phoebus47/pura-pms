'use client';

import { Button } from '@/components/ui/button';

interface FormDialogFooterProps {
  readonly onCancel: () => void;
  readonly loading: boolean;
  readonly submitLabel: string;
  readonly cancelLabel?: string;
}

export function FormDialogFooter({
  onCancel,
  loading,
  submitLabel,
  cancelLabel = 'Cancel',
}: FormDialogFooterProps) {
  return (
    <div className="border-slate-200 border-t flex gap-3 mt-6 pt-6">
      <Button
        type="button"
        onClick={onCancel}
        variant="outline"
        className="flex-1 rounded-xl"
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        className="bg-[#1e4b8e] flex-1 hover:bg-[#153a6e] rounded-xl"
        disabled={loading}
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
