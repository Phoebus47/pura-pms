import { foliosAPI } from './api/folios';
import { toast } from './toast';
import type { PostTransactionDto } from './api/folios';

interface SubmitFolioTransactionOptions {
  readonly folioId: string;
  readonly payload: PostTransactionDto;
  readonly successMessage: string;
  readonly errorPrefix: string;
  readonly onSuccess: () => void;
  readonly onClose: () => void;
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
    await foliosAPI.postTransaction(folioId, payload);
    toast.success(successMessage);
    onSuccess();
    onClose();
  } catch (err) {
    toast.error(`${errorPrefix}: ${(err as Error).message}`);
  }
}
