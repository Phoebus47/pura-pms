import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolioCheckoutBar } from './folio-checkout-bar';
import { foliosAPI, type Folio } from '@/lib/api/folios';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { APIError } from '@/lib/api/client';

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    checkout: vi.fn(),
    setCreditLimit: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const folio = {
  id: 'f1',
  folioNumber: 'F000001',
  reservationId: 'res1',
  type: 'GUEST',
  status: 'OPEN',
  balance: 1500,
  creditLimit: 1000,
  businessDate: '2026-08-14',
  windows: [],
  createdAt: '2026-08-14',
} as Folio;

describe('FolioCheckoutBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders credit limit and checkout controls', () => {
    render(<FolioCheckoutBar folio={folio} onUpdated={vi.fn()} />);
    expect(screen.getByLabelText(t('folios.creditLimit'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('folios.checkout') }),
    ).toBeInTheDocument();
  });

  it('toasts the credit-limit copy when checkout is blocked', async () => {
    vi.mocked(foliosAPI.checkout).mockRejectedValue(
      new APIError(409, 'Conflict', {
        message: 'Folio balance exceeds credit limit',
      }),
    );
    render(<FolioCheckoutBar folio={folio} onUpdated={vi.fn()} />);
    await userEvent.click(
      screen.getByRole('button', { name: t('folios.checkout') }),
    );
    expect(toast.error).toHaveBeenCalledWith(t('folios.creditLimitExceeded'));
  });
});
