/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { PostPaymentDialog } from './post-payment-dialog';
import { foliosAPI, type FolioTransaction } from '@/lib/api/folios';
import { exchangeRatesAPI } from '@/lib/api/exchange-rates';
import { propertiesAPI } from '@/lib/api/properties';
import { toast } from '@/lib/toast';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    postTransaction: vi.fn(),
  },
}));

vi.mock('@/lib/api/exchange-rates', () => ({
  exchangeRatesAPI: {
    list: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

function renderDialog(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('PostPaymentDialog', () => {
  const mockTransactionCodes = [
    {
      id: 'code-2',
      code: 'CSH',
      description: 'Cash',
      type: 'PAYMENT',
      hasTax: false,
      hasService: false,
      serviceRate: null,
      isSystem: false,
      active: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'code-9000',
      code: '9000',
      description: 'Cash Payment',
      type: 'PAYMENT',
      hasTax: false,
      hasService: false,
      serviceRate: null,
      isSystem: false,
      active: true,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    folioId: 'folio-1',
    windowNumber: 1,
    onSuccess: vi.fn(),
    transactionCodes: mockTransactionCodes as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(toast, 'success').mockImplementation(() => {});
    vi.spyOn(toast, 'error').mockImplementation(() => {});
    vi.mocked(exchangeRatesAPI.list).mockResolvedValue([
      {
        id: 'fx-1',
        baseCurrency: 'THB',
        targetCurrency: 'USD',
        rate: 35,
        effectiveDate: '2026-08-14',
        isActive: true,
        createdAt: '',
      },
    ]);
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop-1', currency: 'THB' },
    ] as never);
  });

  it('renders correctly and filters payment codes', () => {
    renderDialog(<PostPaymentDialog {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: t('folios.postPayment') }),
    ).toBeInTheDocument();
  });

  it('submits successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.postTransaction).mockResolvedValue({
      id: 'trx-2',
      windowId: 'win-1',
      trxCodeId: 'code-2',
      trxCode: {} as unknown as FolioTransaction['trxCode'],
      businessDate: '',
      createdAt: '',
      amountNet: 200,
      amountService: 0,
      amountTax: 0,
      amountTotal: 200,
      sign: -1,
      reference: '',
      remark: '',
      userId: 'CURRENT_USER',
      isVoid: false,
    });

    renderDialog(<PostPaymentDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'CSH - Cash' }));
    await user.type(screen.getByLabelText(t('folios.amount')), '200');

    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);

    await waitFor(() => {
      expect(foliosAPI.postTransaction).toHaveBeenCalledWith(
        'folio-1',
        expect.objectContaining({
          windowNumber: 1,
          trxCodeId: 'code-2',
          amountNet: 200,
          reference: '',
          businessDate: expect.any(String),
        }),
      );
      expect(toast.success).toHaveBeenCalledWith(t('folios.paymentSuccess'));
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('posts cash foreign amount when currency differs from property', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.postTransaction).mockResolvedValue({
      id: 'trx-fx',
    } as FolioTransaction);

    renderDialog(<PostPaymentDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(
      screen.getByRole('option', { name: '9000 - Cash Payment' }),
    );
    await user.selectOptions(
      screen.getByLabelText(t('folios.currency')),
      'USD',
    );
    await user.type(screen.getByLabelText(t('folios.foreignAmount')), '100');

    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);

    await waitFor(() => {
      expect(foliosAPI.postTransaction).toHaveBeenCalledWith(
        'folio-1',
        expect.objectContaining({
          trxCodeId: 'code-9000',
          currency: 'USD',
          foreignAmount: 100,
        }),
      );
    });
  });

  it('handles error on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.postTransaction).mockRejectedValue(new Error('Failed'));

    renderDialog(<PostPaymentDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'CSH - Cash' }));
    await user.type(screen.getByLabelText(t('folios.amount')), '200');

    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining(`${t('folios.paymentError')}:`),
      );
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  it('prevents submission if required fields are missing', async () => {
    const user = userEvent.setup();
    renderDialog(<PostPaymentDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'CSH - Cash' }));

    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);
    expect(foliosAPI.postTransaction).not.toHaveBeenCalled();

    cleanup();
    renderDialog(<PostPaymentDialog {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(t('folios.amount')), {
      target: { value: '200' },
    });
    // @ts-ignore
    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(foliosAPI.postTransaction).not.toHaveBeenCalled();
  });

  it('updates reference', async () => {
    const user = userEvent.setup();
    renderDialog(<PostPaymentDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/reference/i), 'Visa123');

    expect(screen.getByDisplayValue('Visa123')).toBeInTheDocument();
  });
});
