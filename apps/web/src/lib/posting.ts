import { foliosAPI } from './api/folios';
import { APIError } from './api/client';
import { toast } from './toast';
import { t } from './i18n';
import type { PostTransactionDto } from './api/folios';

interface SubmitFolioTransactionOptions {
  readonly folioId: string;
  readonly payload: PostTransactionDto;
  readonly successMessage: string;
  readonly errorPrefix: string;
  readonly onSuccess: () => void;
  readonly onClose: () => void;
}

function errorDataMessage(err: APIError): string {
  if (!err.data || typeof err.data !== 'object' || !('message' in err.data)) {
    return '';
  }
  const message = (err.data as { message?: unknown }).message;
  return typeof message === 'string' ? message : '';
}

export function isNoOpenShiftError(err: unknown): boolean {
  if (!(err instanceof APIError) || err.status !== 400) {
    return false;
  }
  const combined = `${errorDataMessage(err)} ${err.message}`.toLowerCase();
  return combined.includes('open shift');
}

export function toastPostingError(err: unknown, errorPrefix: string): void {
  if (isNoOpenShiftError(err)) {
    toast.error(t('shifts.noOpenShift'));
    return;
  }
  if (isArCreditExceededError(err)) {
    toast.error(t('folios.arCreditExceeded'));
    return;
  }
  const suffix = err instanceof Error ? err.message : '';
  toast.error(`${errorPrefix}: ${suffix}`);
}

export function isArCreditExceededError(err: unknown): boolean {
  if (!(err instanceof APIError) || err.status !== 409) {
    return false;
  }
  const combined = `${errorDataMessage(err)} ${err.message}`.toLowerCase();
  return combined.includes('company ar credit');
}

export async function submitFolioTransaction({
  folioId,
  payload,
  successMessage,
  errorPrefix,
  onSuccess,
  onClose,
}: SubmitFolioTransactionOptions) {
  try {
    const posted = await foliosAPI.postTransaction(folioId, payload);
    toast.success(successMessage);
    if (posted.creditLimitExceeded) {
      toast.warning(t('folios.creditLimitExceeded'));
    }
    onSuccess();
    onClose();
  } catch (err) {
    toastPostingError(err, errorPrefix);
  }
}
