import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitFolioTransaction, toastPostingError } from './posting';
import { foliosAPI } from './api/folios';
import { APIError } from './api/client';
import { toast } from './toast';
import { t } from './i18n';
import type { FolioTransaction, PostTransactionDto } from './api/folios';

vi.mock('./api/folios', () => ({
  foliosAPI: {
    postTransaction: vi.fn(),
  },
}));

vi.mock('./toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const payload: PostTransactionDto = {
  windowNumber: 1,
  trxCodeId: 'tc_fnb',
  amountNet: 100,
  userId: 'CURRENT_USER',
  businessDate: '2026-08-14',
};

describe('submitFolioTransaction', () => {
  const onSuccess = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toasts success and closes on a posted transaction', async () => {
    vi.mocked(foliosAPI.postTransaction).mockResolvedValue({
      id: 'ft_1',
    } as FolioTransaction);

    await submitFolioTransaction({
      folioId: 'fol_1',
      payload,
      successMessage: 'Posted',
      errorPrefix: 'Failed to post charge',
      onSuccess,
      onClose,
    });

    expect(foliosAPI.postTransaction).toHaveBeenCalledWith('fol_1', payload);
    expect(toast.success).toHaveBeenCalledWith('Posted');
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('toasts the no-open-shift copy for a 400 open-shift error', async () => {
    vi.mocked(foliosAPI.postTransaction).mockRejectedValue(
      new APIError(400, 'Bad Request', {
        message: 'No open shift for this user and property',
      }),
    );

    await submitFolioTransaction({
      folioId: 'fol_1',
      payload,
      successMessage: 'Posted',
      errorPrefix: 'Failed to post charge',
      onSuccess,
      onClose,
    });

    expect(toast.error).toHaveBeenCalledWith(t('shifts.noOpenShift'));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('toasts the error prefix for other failures', async () => {
    vi.mocked(foliosAPI.postTransaction).mockRejectedValue(new Error('boom'));

    await submitFolioTransaction({
      folioId: 'fol_1',
      payload,
      successMessage: 'Posted',
      errorPrefix: 'Failed to post charge',
      onSuccess,
      onClose,
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to post charge: boom');
  });
});

describe('toastPostingError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the generic prefix when a 400 is unrelated to shifts', () => {
    toastPostingError(
      new APIError(400, 'Bad Request', { message: 'Window not found' }),
      'Failed to void transaction',
    );
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to void transaction: API Error: 400 Bad Request',
    );
  });
});
