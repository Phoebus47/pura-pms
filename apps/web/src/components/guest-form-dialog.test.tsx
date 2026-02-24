/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GuestFormDialog } from './guest-form-dialog';
import { guestsAPI } from '@/lib/api';

describe('GuestFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockGuest = {
    id: '1',
    firstName: 'Existing',
    lastName: 'Guest',
    email: 'test@example.com',
    phone: '1234567890',
    nationality: 'Thai',
    idNumber: 'ID123',
    address: '123 Test Rd',
    vipLevel: 1,
    isBlacklist: false,
    totalStays: 0,
    totalRevenue: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form elements', () => {
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    expect(screen.getByText('New Guest')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vip level standard/i)).toBeInTheDocument();
  });

  it('pre-fills data', () => {
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        guest={mockGuest}
      />,
    );
    expect(screen.getByText('Edit Guest')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Existing');
    expect(screen.getByLabelText(/vip level 1/i)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('submits new guest', async () => {
    vi.spyOn(guestsAPI, 'create').mockResolvedValue({
      ...mockGuest,
      id: 'new',
    } as any);
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'New' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '0999999999' },
    });
    fireEvent.change(screen.getByLabelText(/nationality/i), {
      target: { value: 'US' },
    });
    fireEvent.change(screen.getByLabelText(/id number/i), {
      target: { value: 'P123' },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: 'Address' },
    });

    // Select VIP Level 2
    fireEvent.click(screen.getByLabelText(/vip level 2/i));

    fireEvent.click(screen.getByRole('button', { name: /create guest/i }));

    await waitFor(() => {
      expect(guestsAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'New',
          lastName: 'User',
          email: 'new@test.com',
          vipLevel: 2,
        }),
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles update guest', async () => {
    vi.spyOn(guestsAPI, 'update').mockResolvedValue(mockGuest as any);
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        guest={mockGuest}
      />,
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

    fireEvent.click(screen.getByRole('button', { name: /update guest/i }));

    await waitFor(() => {
      expect(guestsAPI.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          firstName: 'Updated',
        }),
      );
    });
  });

  it('handles submission error when unknown error occurs', async () => {
    vi.spyOn(guestsAPI, 'create').mockRejectedValue('Unknown error');
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Fail' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Fail' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create guest/i }));

    await waitFor(() =>
      expect(screen.getByText('Failed to save guest')).toBeInTheDocument(),
    );
  });

  it('handles submission error with message', async () => {
    vi.spyOn(guestsAPI, 'create').mockRejectedValue(new Error('API Error'));
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Fail' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Fail' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create guest/i }));

    await waitFor(() =>
      expect(screen.getByText('API Error')).toBeInTheDocument(),
    );
  });

  it('handles editing guest with missing optional fields', () => {
    const minGuest = {
      ...mockGuest,
      email: undefined,
      phone: undefined,
      nationality: undefined,
      idNumber: undefined,
      address: undefined,
    };
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        guest={minGuest as any}
      />,
    );
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('');
    expect(screen.getByLabelText(/nationality/i)).toHaveValue('');
    expect(screen.getByLabelText(/id number/i)).toHaveValue('');
    expect(screen.getByLabelText(/address/i)).toHaveValue('');
  });
});
