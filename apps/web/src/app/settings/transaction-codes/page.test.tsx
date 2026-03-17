import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionCodesSettingsPage from './page';

vi.mock('@/lib/api/transaction-codes', () => ({
  transactionCodesAPI: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const { transactionCodesAPI } = await import('@/lib/api/transaction-codes');

describe('TransactionCodesSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list from API', async () => {
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        id: 'tc-1',
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      },
    ]);

    render(<TransactionCodesSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument();
    });
    expect(screen.getByText('Room Charge')).toBeInTheDocument();
  });

  it('renders tax/service columns for edge values', async () => {
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        id: 'tc-1',
        code: 'NO_TAX',
        description: 'No Tax',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: false,
        hasService: false,
        glAccountCode: '4000-01',
      },
      {
        id: 'tc-2',
        code: 'SRV_FALLBACK',
        description: 'Service Fallback',
        type: 'CHARGE',
        group: 'FOOD',
        hasTax: true,
        hasService: true,
        // serviceRate intentionally omitted to exercise ?? 0
        glAccountCode: '4100-01',
      },
    ]);

    render(<TransactionCodesSettingsPage />);

    await screen.findByText('NO_TAX');
    expect(screen.getAllByText('No').length).toBeGreaterThanOrEqual(2); // tax+service false branches
    expect(screen.getByText('SRV_FALLBACK')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument(); // serviceRate ?? 0 branch
  });

  it('filters by search query and refreshes list', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        {
          id: 'tc-1',
          code: '1000',
          description: 'Room Charge',
          type: 'CHARGE',
          group: 'ROOM',
          hasTax: true,
          hasService: true,
          serviceRate: 10,
          glAccountCode: '4000-01',
        },
        {
          id: 'tc-2',
          code: '2000',
          description: 'Breakfast',
          type: 'CHARGE',
          group: 'FOOD',
          hasTax: true,
          hasService: true,
          serviceRate: 7,
          glAccountCode: '4100-01',
        },
      ])
      .mockResolvedValueOnce([]);

    render(<TransactionCodesSettingsPage />);
    await screen.findByText('1000');
    expect(screen.getByText('2000')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/search by code/i), 'break');
    expect(screen.queryByText('1000')).not.toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /refresh/i }));
    await waitFor(() => {
      expect(transactionCodesAPI.list).toHaveBeenCalledTimes(2);
    });
  });

  it('uses fallback message when list throws non-Error', async () => {
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue('nope');

    render(<TransactionCodesSettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load transaction codes'),
      ).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('boom'));

    render(<TransactionCodesSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('boom')).toBeInTheDocument();
    });
  });

  it('can open edit dialog and call update', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        id: 'tc-1',
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      },
    ]);
    (
      transactionCodesAPI.update as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});

    render(<TransactionCodesSettingsPage />);

    await screen.findByText('1000');
    await user.click(screen.getByRole('button', { name: /edit/i }));
    await screen.findByText('Edit Transaction Code');

    const desc = screen.getByLabelText('Description');
    await user.clear(desc);
    await user.type(desc, 'Updated');

    const form = desc.closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(transactionCodesAPI.update).toHaveBeenCalledWith(
        'tc-1',
        expect.objectContaining({ description: 'Updated' }),
      );
    });
  });

  it('edit uses default service rate when missing', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        id: 'tc-1',
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        // serviceRate intentionally omitted
        glAccountCode: '4000-01',
      },
    ]);

    render(<TransactionCodesSettingsPage />);
    await screen.findByText('1000');

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await screen.findByText('Edit Transaction Code');

    expect(screen.getByLabelText('Service %')).toHaveValue(10);
  });

  it('edit update with hasService off sends undefined serviceRate', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        id: 'tc-1',
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      },
    ]);
    (
      transactionCodesAPI.update as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});

    render(<TransactionCodesSettingsPage />);
    await screen.findByText('1000');

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await screen.findByText('Edit Transaction Code');

    const serviceToggle = screen.getByLabelText('Apply Service Charge');
    fireEvent.click(serviceToggle);
    fireEvent.change(serviceToggle, { target: { checked: false } });

    const form = screen.getByLabelText('Description').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(transactionCodesAPI.update).toHaveBeenCalledWith(
        'tc-1',
        expect.objectContaining({
          hasService: false,
          serviceRate: undefined,
        }),
      );
    });
  });

  it('disables service rate when service is unchecked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    render(<TransactionCodesSettingsPage />);

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');

    const serviceRate = screen.getByLabelText('Service %');
    expect(serviceRate).not.toBeDisabled();

    const serviceToggle = screen.getByLabelText('Apply Service Charge');
    fireEvent.click(serviceToggle);
    fireEvent.change(serviceToggle, { target: { checked: false } });
    await waitFor(() => {
      expect(screen.getByLabelText('Service %')).toBeDisabled();
    });
  });

  it('opens create dialog and calls create', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (
      transactionCodesAPI.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: 'tc-1',
      code: '1000',
      description: 'Room Charge',
      type: 'CHARGE',
      group: 'ROOM',
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-01',
    });

    render(<TransactionCodesSettingsPage />);

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');

    await user.type(screen.getByLabelText('Code'), '1000');
    await user.type(screen.getByLabelText('GL Account'), '4000-01');
    await user.type(screen.getByLabelText('Description'), 'Room Charge');

    const form = screen.getByLabelText('Description').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(transactionCodesAPI.create).toHaveBeenCalled();
    });
  });

  it('closes dialog on cancel and on escape', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    render(<TransactionCodesSettingsPage />);

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(
        screen.queryByText('New Transaction Code'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(
        screen.queryByText('New Transaction Code'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows generic error when save throws non-Error', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (
      transactionCodesAPI.create as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue('nope');

    render(<TransactionCodesSettingsPage />);

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');

    await user.type(screen.getByLabelText('Code'), '1000');
    await user.type(screen.getByLabelText('GL Account'), '4000-01');
    await user.type(screen.getByLabelText('Description'), 'Room Charge');

    const form = screen.getByLabelText('Description').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to save transaction code'),
      ).toBeInTheDocument();
    });
  });

  it('shows error message when save throws Error', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (
      transactionCodesAPI.create as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('bad'));

    render(<TransactionCodesSettingsPage />);

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');

    await user.type(screen.getByLabelText('Code'), '1000');
    await user.type(screen.getByLabelText('GL Account'), '4000-01');
    await user.type(screen.getByLabelText('Description'), 'Room Charge');

    const form = screen.getByLabelText('Description').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getByText('bad')).toBeInTheDocument();
    });
  });

  it('creates with hasService off (no serviceRate)', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (
      transactionCodesAPI.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});

    render(<TransactionCodesSettingsPage />);

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');

    await user.type(screen.getByLabelText('Code'), '3000');
    await user.type(screen.getByLabelText('GL Account'), '4200-01');
    await user.type(screen.getByLabelText('Description'), 'Cash Payment');

    const serviceToggle = screen.getByLabelText('Apply Service Charge');
    fireEvent.click(serviceToggle);
    fireEvent.change(serviceToggle, { target: { checked: false } });

    const form = screen.getByLabelText('Description').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(transactionCodesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: '3000',
          hasService: false,
          serviceRate: undefined,
        }),
      );
    });
  });

  it('updates VAT toggle, group/type, and service rate', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    (
      transactionCodesAPI.list as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (
      transactionCodesAPI.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});

    render(<TransactionCodesSettingsPage />);

    await user.click(screen.getByRole('button', { name: /new code/i }));
    await screen.findByText('New Transaction Code');

    await user.type(screen.getByLabelText('Code'), '2000');
    await user.type(screen.getByLabelText('GL Account'), '4100-01');
    await user.type(screen.getByLabelText('Description'), 'Breakfast');

    // change selects
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'PAYMENT' },
    });
    fireEvent.change(screen.getByLabelText('Group'), {
      target: { value: 'FOOD' },
    });

    // toggle VAT off then on (hit onChange branch)
    const vatToggle = screen.getByLabelText('Apply VAT');
    fireEvent.click(vatToggle);
    fireEvent.change(vatToggle, { target: { checked: false } });
    fireEvent.click(vatToggle);
    fireEvent.change(vatToggle, { target: { checked: true } });

    // change service rate input
    await user.clear(screen.getByLabelText('Service %'));
    await user.type(screen.getByLabelText('Service %'), '7');

    const form = screen.getByLabelText('Description').closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(transactionCodesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: '2000',
          type: 'PAYMENT',
          group: 'FOOD',
          hasTax: true,
          serviceRate: 7,
        }),
      );
    });
  });
});
