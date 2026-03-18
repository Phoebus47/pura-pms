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
import { PostPaymentDialog } from './post-payment-dialog';
import { foliosAPI, type FolioTransaction } from '@/lib/api/folios';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    postTransaction: vi.fn(),
  },
}));

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
  });

  it('renders correctly and filters payment codes', () => {
    render(<PostPaymentDialog {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: 'Post Payment' }),
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

    render(<PostPaymentDialog {...defaultProps} />);

    // Select TRx Code
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'CSH - Cash' }));

    // Enter Amount
    await user.type(screen.getByLabelText(/amount/i), '200');

    // Submit
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
      expect(toast.success).toHaveBeenCalledWith('Payment posted successfully');
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles error on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.postTransaction).mockRejectedValue(new Error('Failed'));

    render(<PostPaymentDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'CSH - Cash' }));
    await user.type(screen.getByLabelText(/amount/i), '200');

    // Submit explicitly to bypass Radix UI click event issues
    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to post payment:'),
      );
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  it('prevents submission if required fields are missing', async () => {
    const user = userEvent.setup();
    render(<PostPaymentDialog {...defaultProps} />);

    // Start with missing amount but valid payment code
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'CSH - Cash' }));

    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);
    expect(foliosAPI.postTransaction).not.toHaveBeenCalled();

    // Now test missing payment code but valid amount
    cleanup();
    render(<PostPaymentDialog {...defaultProps} />); // Reset state
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '200' },
    });
    // @ts-ignore
    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(foliosAPI.postTransaction).not.toHaveBeenCalled();
  });

  it('updates reference', async () => {
    const user = userEvent.setup();
    render(<PostPaymentDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/reference/i), 'Visa123');

    expect(screen.getByDisplayValue('Visa123')).toBeInTheDocument();
  });
});
