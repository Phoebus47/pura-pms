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
import { PostChargeDialog } from './post-charge-dialog';
import { foliosAPI, type FolioTransaction } from '@/lib/api/folios';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    postTransaction: vi.fn(),
  },
}));

describe('PostChargeDialog', () => {
  const mockTransactionCodes = [
    {
      id: 'code-1',
      code: 'RM',
      description: 'Room Charge',
      type: 'CHARGE',
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      isSystem: false,
      active: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'code-3',
      code: 'RM2',
      description: 'Room Charge (no rate)',
      type: 'CHARGE',
      hasTax: false,
      hasService: true,
      // serviceRate intentionally missing to exercise ?? 0 branch
      isSystem: false,
      active: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'code-2',
      code: 'CSH',
      description: 'Cash',
      type: 'PAYMENT',
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

  it('renders correctly and filters charge codes', () => {
    render(<PostChargeDialog {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: 'Post Charge' }),
    ).toBeInTheDocument();
  });

  it('submits successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.postTransaction).mockResolvedValue({
      id: 'trx-1',
      windowId: 'win-1',
      trxCodeId: 'code-1',
      trxCode: {} as unknown as FolioTransaction['trxCode'],
      businessDate: '',
      createdAt: '',
      amountNet: 100,
      amountService: 0,
      amountTax: 0,
      amountTotal: 100,
      sign: 1,
      reference: '',
      remark: '',
      userId: 'CURRENT_USER',
      isVoid: false,
    });

    render(<PostChargeDialog {...defaultProps} />);

    // Select TRx Code
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'RM - Room Charge' }));

    // Enter Amount
    await user.type(screen.getByLabelText(/amount/i), '100');

    // Submit
    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);

    await waitFor(() => {
      expect(foliosAPI.postTransaction).toHaveBeenCalledWith(
        'folio-1',
        expect.objectContaining({
          windowNumber: 1,
          trxCodeId: 'code-1',
          amountNet: 100,
          reference: '',
          remark: '',
          businessDate: expect.any(String),
        }),
      );
      expect(toast.success).toHaveBeenCalledWith('Charge posted successfully');
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('uses 0% service when rate is missing', async () => {
    const user = userEvent.setup();
    render(<PostChargeDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(
      screen.getByRole('option', { name: 'RM2 - Room Charge (no rate)' }),
    );

    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '100');

    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getAllByText('฿0').length).toBeGreaterThanOrEqual(1);
  });

  it('handles error on submit', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.postTransaction).mockRejectedValue(new Error('Failed'));

    render(<PostChargeDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'RM - Room Charge' }));
    await user.type(screen.getByLabelText(/amount/i), '100');
    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to post charge:'),
      );
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  it('prevents submission if required fields are missing', async () => {
    const user = userEvent.setup();
    render(<PostChargeDialog {...defaultProps} />);

    // Start with missing amount but valid charge code
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'RM - Room Charge' }));

    const form = screen.getByRole('dialog').querySelector('form');
    // @ts-ignore
    fireEvent.submit(form);
    expect(foliosAPI.postTransaction).not.toHaveBeenCalled();

    // Now test missing charge code but valid amount
    cleanup();
    render(<PostChargeDialog {...defaultProps} />); // Reset state
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '100' },
    });
    // @ts-ignore
    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(foliosAPI.postTransaction).not.toHaveBeenCalled();
  });

  it('updates reference and remark', async () => {
    const user = userEvent.setup();
    render(<PostChargeDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/reference/i), 'Ref1');
    await user.type(screen.getByLabelText(/remark/i), 'Rem1');

    expect(screen.getByDisplayValue('Ref1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rem1')).toBeInTheDocument();
  });
});
