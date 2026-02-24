/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolioDetail } from './folio-detail';
import { foliosAPI } from '@/lib/api/folios';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    getByReservationId: vi.fn(),
    getTransactionCodes: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('./post-charge-dialog', () => ({
  PostChargeDialog: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="charge-dialog">
        <button onClick={onClose}>Close Charge</button>
        <button onClick={onSuccess}>Success Charge</button>
      </div>
    ) : null,
}));

vi.mock('./post-payment-dialog', () => ({
  PostPaymentDialog: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="payment-dialog">
        <button onClick={onClose}>Close Payment</button>
        <button onClick={onSuccess}>Success Payment</button>
      </div>
    ) : null,
}));

describe('FolioDetail', () => {
  const mockFolio = {
    id: 'f1',
    reservationId: 'res1',
    folioNumber: '1001',
    status: 'ACTIVE',
    type: 'GUEST',
    notes: '',
    balance: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    windows: [
      {
        id: 'w1',
        folioId: 'f1',
        windowNumber: 1,
        balance: 500,
        transactions: [
          {
            id: 't1',
            windowId: 'w1',
            trxCodeId: 'tc1',
            amountNet: 100,
            amountExt: 100,
            amountTax: 10,
            amountService: 0,
            amountTotal: 110,
            sign: 1,
            isVoid: false,
            createdAt: new Date().toISOString(),
            trxCode: {
              code: 'RM',
              description: 'Room Charge',
            },
            reference: 'Night 1',
          },
          {
            id: 't2',
            windowId: 'w1',
            trxCodeId: 'tc2',
            amountNet: 50,
            amountExt: 50,
            amountTax: 0,
            amountService: 0,
            amountTotal: 50,
            sign: -1,
            isVoid: true,
            createdAt: new Date().toISOString(),
            trxCode: {
              code: 'CSH',
              description: 'Cash',
            },
          },
        ],
      },
      {
        id: 'w2',
        folioId: 'f1',
        windowNumber: 2,
        balance: 0,
        transactions: [],
      },
    ],
  };

  const mockTransactionCodes = [
    { id: 'tc1', code: 'RM', type: 'CHARGE', active: true },
    { id: 'tc2', code: 'CSH', type: 'PAYMENT', active: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (foliosAPI.getByReservationId as any).mockResolvedValue([mockFolio]);
    (foliosAPI.getTransactionCodes as any).mockResolvedValue(
      mockTransactionCodes,
    );
  });

  it('renders loading initially', () => {
    (foliosAPI.getByReservationId as any).mockReturnValue(
      new Promise(() => {}),
    );
    render(<FolioDetail reservationId="res1" />);
    expect(screen.getByText('Loading billing data...')).toBeInTheDocument();
  });

  it('renders no folio found', async () => {
    (foliosAPI.getByReservationId as any).mockResolvedValue([]);
    render(<FolioDetail reservationId="res1" />);

    await waitFor(() => {
      expect(screen.getByText('No Folio Found')).toBeInTheDocument();
    });
  });

  it('renders error on fetch failure', async () => {
    (foliosAPI.getByReservationId as any).mockRejectedValue(new Error('fail'));
    render(<FolioDetail reservationId="res1" />);

    await waitFor(() => {
      expect(screen.getByText(/No Folio Found/i)).toBeInTheDocument();
    });
  });

  it('renders folio with transactions', async () => {
    render(<FolioDetail reservationId="res1" />);

    await waitFor(() => {
      expect(screen.getByText('Folio 1001 (GUEST)')).toBeInTheDocument();
    });

    expect(screen.getByText('RM')).toBeInTheDocument();
    expect(screen.getByText('Room Charge')).toBeInTheDocument();
    expect(screen.getByText(/Night 1/)).toBeInTheDocument();
    expect(screen.getByText('CSH')).toBeInTheDocument();
  });

  it('switches windows', async () => {
    const user = userEvent.setup();
    render(<FolioDetail reservationId="res1" />);

    await waitFor(() => {
      expect(screen.getByText('Folio 1001 (GUEST)')).toBeInTheDocument();
    });

    const window2Tab = screen.getByText('Window 2');
    await user.click(window2Tab);

    await waitFor(() => {
      expect(
        screen.getByText('No transactions found in this window.'),
      ).toBeInTheDocument();
    });
  });

  it('switches folios', async () => {
    const user = userEvent.setup();
    const secondFolio = {
      ...mockFolio,
      id: 'f2',
      folioNumber: '1002',
      type: 'COMPANY',
      windows: [],
    };
    (foliosAPI.getByReservationId as any).mockResolvedValue([
      mockFolio,
      secondFolio,
    ]);

    render(<FolioDetail reservationId="res1" />);
    await waitFor(() => {
      expect(screen.getByText('Folio 1001 (GUEST)')).toBeInTheDocument();
      expect(screen.getByText('Folio 1002 (COMPANY)')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Folio 1002 (COMPANY)'));
    // Once clicked, it switches folio and sets window to 1.
    expect(screen.getByText('Folio 1002 (COMPANY)')).toHaveClass(
      'bg-[#1e4b8e]',
    );
  });

  it('opens and closes post charge dialog', async () => {
    const user = userEvent.setup();
    render(<FolioDetail reservationId="res1" />);
    await waitFor(() =>
      expect(screen.getByText('Folio 1001 (GUEST)')).toBeInTheDocument(),
    );

    await user.click(screen.getByText('Post Charge'));
    expect(screen.getByTestId('charge-dialog')).toBeInTheDocument();

    await user.click(screen.getByText('Close Charge'));
    expect(screen.queryByTestId('charge-dialog')).not.toBeInTheDocument();
  });

  it('handles post charge success (reload data)', async () => {
    const user = userEvent.setup();
    render(<FolioDetail reservationId="res1" />);
    await waitFor(() =>
      expect(screen.getByText('Folio 1001 (GUEST)')).toBeInTheDocument(),
    );

    await user.click(screen.getByText('Post Charge'));
    await user.click(screen.getByText('Success Charge'));

    // Should call getByReservationId again
    expect(foliosAPI.getByReservationId).toHaveBeenCalledTimes(3);
  });

  it('opens and closes post payment dialog', async () => {
    const user = userEvent.setup();
    render(<FolioDetail reservationId="res1" />);
    await waitFor(() =>
      expect(screen.getByText('Folio 1001 (GUEST)')).toBeInTheDocument(),
    );

    await user.click(screen.getByText('Post Payment'));
    expect(screen.getByTestId('payment-dialog')).toBeInTheDocument();

    await user.click(screen.getByText('Close Payment'));
    expect(screen.queryByTestId('payment-dialog')).not.toBeInTheDocument();

    await user.click(screen.getByText('Post Payment'));
    await user.click(screen.getByText('Success Payment'));
    expect(foliosAPI.getByReservationId).toHaveBeenCalledTimes(3);
  });

  it('renders zero balance correctly for folio and window', async () => {
    const user = userEvent.setup();
    const zeroFolio = {
      ...mockFolio,
      id: 'f-zero',
      balance: 0,
      windows: [
        {
          id: 'w-zero',
          folioId: 'f-zero',
          windowNumber: 1,
          balance: 0,
          transactions: [
            {
              id: 'rt1',
              date: '2024-01-01',
              description: 'Zero Charge',
              amount: 0,
              windowNumber: 1,
              trxCode: {
                id: 'tc1',
                code: 'RM',
                type: 'CHARGE',
                description: 'Room Charge',
              },
            },
          ],
        },
      ],
    };
    (foliosAPI.getByReservationId as any).mockResolvedValue([zeroFolio]);

    render(<FolioDetail reservationId="res-zero" />);

    await waitFor(() => {
      expect(screen.getByText('Folio 1001 (GUEST)')).toBeInTheDocument();
    });

    // Both the Folio balance and the Window balance are 0
    // So both should render text-emerald-600
    const zeroBalances = screen.getAllByText('฿0');
    expect(zeroBalances.length).toBe(2);
    expect(zeroBalances[0]).toHaveClass('text-emerald-600');
    expect(zeroBalances[1]).toHaveClass('text-emerald-600');
  });

  it('renders sign correctly for charges and payments', async () => {
    (foliosAPI.getByReservationId as any).mockResolvedValue([mockFolio]);
    render(<FolioDetail reservationId="res1" />);

    await waitFor(() => {
      expect(screen.getByText('฿110')).toHaveClass('text-red-600');
    });
    expect(screen.getByText('-฿50')).toHaveClass('text-emerald-600');
  });

  it('renders window balance badge when non-zero', async () => {
    (foliosAPI.getByReservationId as any).mockResolvedValue([mockFolio]);
    render(<FolioDetail reservationId="res1" />);

    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument(); // Badge content
    });
  });
});
