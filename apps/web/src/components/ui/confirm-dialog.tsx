'use client';

import { useState, useCallback } from 'react';
import { Button } from './button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<Omit<
    ConfirmDialogProps,
    'onConfirm' | 'onCancel'
  > | null>(null);
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void | Promise<void>) | null
  >(null);
  const [onCancelCallback, setOnCancelCallback] = useState<(() => void) | null>(
    null,
  );

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      options?: {
        confirmText?: string;
        cancelText?: string;
        onCancel?: () => void;
      },
    ) => {
      setDialog({
        title,
        message,
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
      });
      setOnConfirmCallback(() => onConfirm);
      setOnCancelCallback(() => options?.onCancel || undefined);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (onConfirmCallback) {
      await onConfirmCallback();
    }
    setDialog(null);
    setOnConfirmCallback(null);
    setOnCancelCallback(null);
  }, [onConfirmCallback]);

  const handleCancel = useCallback(() => {
    if (onCancelCallback) {
      onCancelCallback();
    }
    setDialog(null);
    setOnConfirmCallback(null);
    setOnCancelCallback(null);
  }, [onCancelCallback]);

  const Dialog = dialog ? (
    <dialog
      className="backdrop-blur-sm bg-black/50 bg-transparent border-0 fixed flex h-full inset-0 items-center justify-center w-full z-50"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      open
    >
      <div className="bg-white border border-slate-200 max-w-md mx-4 p-6 rounded-2xl shadow-2xl w-full">
        <h3
          id="confirm-dialog-title"
          className="font-semibold mb-2 text-lg text-slate-900"
        >
          {dialog.title}
        </h3>
        <p id="confirm-dialog-description" className="mb-6 text-slate-600">
          {dialog.message}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            {dialog.cancelText}
          </Button>
          <Button onClick={handleConfirm}>{dialog.confirmText}</Button>
        </div>
      </div>
    </dialog>
  ) : null;

  return { confirm, Dialog };
}
