/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoidTransactionDialog } from './void-transaction-dialog';
import { reasonCodesAPI } from '@/lib/api/reason-codes';
import { foliosAPI } from '@/lib/api/folios';
import { toast } from '@/lib/toast';

vi.mock('@/components/ui/button', async (importOriginal) => {
  const actual: any = await importOriginal();
  const ReactMock = await import('react');
  return {
    ...actual,
    Button: ReactMock.forwardRef(({ disabled, ...props }: any, ref: any) => (
      <button {...props} ref={ref} data-disabled={disabled} />
    )),
  };
});

vi.mock('@/lib/api/reason-codes', () => ({
  reasonCodesAPI: {
    list: vi.fn(),
  },
}));

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    voidTransaction: vi.fn(),
  },
}));

describe('VoidTransactionDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    transactionId: 'trx-1',
    onSuccess: vi.fn(),
  };

  const mockReasons = [
    {
      id: 'reason-1',
      code: 'VOID',
      description: 'Void transaction',
      category: 'VOID',
      isActive: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(toast, 'success').mockImplementation(() => {});
    vi.spyOn(toast, 'error').mockImplementation(() => {});
    vi.mocked(reasonCodesAPI.list).mockResolvedValue(mockReasons as any);
  });

  it('loads and renders reason codes', async () => {
    render(<VoidTransactionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });

    const trigger = screen.getByText('Select a reason');
    expect(trigger).toBeInTheDocument();
  });

  it('submits successfully when reason selected', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.voidTransaction).mockResolvedValue({
      id: 'trx-void',
    } as any);

    render(<VoidTransactionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Void transaction/ }));

    const remark = screen.getByLabelText(/remark/i);
    await user.type(remark, 'Test remark');

    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(foliosAPI.voidTransaction).toHaveBeenCalledWith(
        'trx-1',
        expect.objectContaining({
          userId: 'CURRENT_USER',
          reasonCodeId: 'reason-1',
          remark: 'Test remark',
        }),
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Transaction voided successfully',
      );
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('disables confirm button when no reason selected', async () => {
    render(<VoidTransactionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    expect(confirmButton).toHaveAttribute('data-disabled', 'true');
  });

  it('handles error when loading reason codes fails', async () => {
    vi.mocked(reasonCodesAPI.list).mockRejectedValueOnce(
      new Error('Failed to load'),
    );

    render(<VoidTransactionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load reason codes:'),
      );
    });
  });

  it('handles error when voiding transaction fails', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.voidTransaction).mockRejectedValueOnce(
      new Error('Failed to void'),
    );

    render(<VoidTransactionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Void transaction/ }));

    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to void transaction:'),
      );
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  it('does not load reason codes when dialog is closed (isOpen=false)', () => {
    render(<VoidTransactionDialog {...defaultProps} isOpen={false} />);
    expect(reasonCodesAPI.list).not.toHaveBeenCalled();
  });

  it('resets form when isOpen changes to false', async () => {
    const { rerender } = render(
      <VoidTransactionDialog {...defaultProps} isOpen={true} />,
    );
    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });
    rerender(<VoidTransactionDialog {...defaultProps} isOpen={false} />);
    expect(reasonCodesAPI.list).toHaveBeenCalledTimes(1);
  });

  it('runs effect cleanup on unmount', async () => {
    const { unmount } = render(
      <VoidTransactionDialog {...defaultProps} isOpen={true} />,
    );
    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });
    unmount();
  });

  it('calls onClose when dialog is closed via onOpenChange (e.g. Escape)', async () => {
    const user = userEvent.setup();
    render(<VoidTransactionDialog {...defaultProps} />);
    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('submits with empty remark when remark not filled', async () => {
    const user = userEvent.setup();
    vi.mocked(foliosAPI.voidTransaction).mockResolvedValue({
      id: 'trx-void',
    } as any);

    render(<VoidTransactionDialog {...defaultProps} />);

    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Void transaction/ }));

    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(foliosAPI.voidTransaction).toHaveBeenCalledWith(
        'trx-1',
        expect.objectContaining({
          userId: 'CURRENT_USER',
          reasonCodeId: 'reason-1',
          remark: undefined,
        }),
      );
    });
  });

  it('does not submit when transactionId is null (guard)', async () => {
    const user = userEvent.setup();
    render(<VoidTransactionDialog {...defaultProps} transactionId={null} />);
    await waitFor(() => {
      expect(reasonCodesAPI.list).toHaveBeenCalled();
    });
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Void transaction/ }));
    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    expect(confirmButton).toHaveAttribute('data-disabled', 'true');
  });

  it('hits Case 1 guard: transactionId null', async () => {
    render(<VoidTransactionDialog {...defaultProps} transactionId={null} />);
    await waitFor(() => expect(reasonCodesAPI.list).toHaveBeenCalled());
    const confirmButton = screen.getByRole('button', { name: /confirm void/i });

    expect(confirmButton).toHaveAttribute('data-disabled', 'true');
    fireEvent.click(confirmButton);
    expect(foliosAPI.voidTransaction).not.toHaveBeenCalled();
  });

  it('hits Case 2 guard: selectedReasonId empty', async () => {
    render(<VoidTransactionDialog {...defaultProps} />);
    await waitFor(() => expect(reasonCodesAPI.list).toHaveBeenCalled());
    const confirmButton = screen.getByRole('button', { name: /confirm void/i });

    expect(confirmButton).toHaveAttribute('data-disabled', 'true');
    fireEvent.click(confirmButton);
    expect(foliosAPI.voidTransaction).not.toHaveBeenCalled();
  });

  it('hits Case 3 guard: submitting true', async () => {
    const user = userEvent.setup();
    render(<VoidTransactionDialog {...defaultProps} />);
    await waitFor(() => expect(reasonCodesAPI.list).toHaveBeenCalled());

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Void transaction/ }));

    let resolveVoid: any;
    vi.mocked(foliosAPI.voidTransaction).mockReturnValue(
      new Promise((resolve) => {
        resolveVoid = resolve;
      }),
    );

    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    await user.click(confirmButton);
    await waitFor(() =>
      expect(confirmButton).toHaveAttribute('data-disabled', 'true'),
    );

    fireEvent.click(confirmButton);
    expect(foliosAPI.voidTransaction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveVoid({ id: 'done' });
    });
  });

  it('covers remark fallback branch', async () => {
    const user = userEvent.setup();
    render(<VoidTransactionDialog {...defaultProps} />);
    await waitFor(() => expect(reasonCodesAPI.list).toHaveBeenCalled());
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Void transaction/ }));

    const remarkInput = screen.getByLabelText(/remark/i);
    await user.clear(remarkInput);

    vi.mocked(foliosAPI.voidTransaction).mockResolvedValue({ id: 'ok' } as any);
    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    await user.click(confirmButton);

    expect(foliosAPI.voidTransaction).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ remark: undefined }),
    );
  });

  it('covers useEffect error and fallback', async () => {
    vi.mocked(reasonCodesAPI.list).mockRejectedValueOnce({});
    render(<VoidTransactionDialog {...defaultProps} />);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to load reason codes: '),
    );
  });

  it('covers void error fallback', async () => {
    const user = userEvent.setup();
    render(<VoidTransactionDialog {...defaultProps} />);
    await waitFor(() => expect(reasonCodesAPI.list).toHaveBeenCalled());
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Void transaction/ }));

    vi.mocked(foliosAPI.voidTransaction).mockRejectedValueOnce({});
    const confirmButton = screen.getByRole('button', { name: /confirm void/i });
    await user.click(confirmButton);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed to void transaction: '),
    );
  });

  it('covers useEffect cancellation', async () => {
    let resolveCodes: any;
    vi.mocked(reasonCodesAPI.list).mockReturnValue(
      new Promise((resolve) => {
        resolveCodes = resolve;
      }) as any,
    );
    const { unmount } = render(
      <VoidTransactionDialog {...defaultProps} isOpen={true} />,
    );
    unmount();
    await act(async () => {
      resolveCodes(mockReasons);
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('covers useEffect error cancellation', async () => {
    let rejectCodes: any;
    vi.mocked(reasonCodesAPI.list).mockReturnValue(
      new Promise((_, reject) => {
        rejectCodes = reject;
      }) as any,
    );
    const { unmount } = render(
      <VoidTransactionDialog {...defaultProps} isOpen={true} />,
    );
    unmount();
    await act(async () => {
      rejectCodes(new Error('fail'));
    });
    expect(toast.error).not.toHaveBeenCalled();
  });
});
