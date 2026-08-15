import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { FolioCheckoutBar } from './folio-checkout-bar';
import { foliosAPI, type Folio } from '@/lib/api/folios';
import { arAccountsAPI } from '@/lib/api/ar-accounts';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { APIError } from '@/lib/api/client';

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    checkout: vi.fn(),
    setCreditLimit: vi.fn(),
    setArAccount: vi.fn(),
  },
}));

vi.mock('@/lib/api/ar-accounts', () => ({
  arAccountsAPI: {
    list: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
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

function renderBar(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('FolioCheckoutBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(arAccountsAPI.list).mockResolvedValue([]);
  });

  it('renders credit limit and checkout controls', () => {
    renderBar(<FolioCheckoutBar folio={folio} onUpdated={vi.fn()} />);
    expect(screen.getByLabelText(t('folios.creditLimit'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('folios.arAccountId'))).toBeInTheDocument();
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
    renderBar(<FolioCheckoutBar folio={folio} onUpdated={vi.fn()} />);
    await userEvent.click(
      screen.getByRole('button', { name: t('folios.checkout') }),
    );
    expect(toast.error).toHaveBeenCalledWith(t('folios.creditLimitExceeded'));
  });
});
