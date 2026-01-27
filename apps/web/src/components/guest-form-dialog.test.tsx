import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestFormDialog } from './guest-form-dialog';
import { guestsAPI } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  guestsAPI: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('GuestFormDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
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
    jest.clearAllMocks();
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
    (guestsAPI.create as jest.Mock).mockResolvedValue({
      ...mockGuest,
      id: 'new',
    });
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/first name/i), 'New');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/email/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText(/phone/i), '0999999999');
    await userEvent.type(screen.getByLabelText(/nationality/i), 'US');
    await userEvent.type(screen.getByLabelText(/id number/i), 'P123');
    await userEvent.type(screen.getByLabelText(/address/i), 'Address');

    // Select VIP Level 2
    await userEvent.click(screen.getByLabelText(/vip level 2/i));

    await userEvent.click(
      screen.getByRole('button', { name: /create guest/i }),
    );

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

  it('handles update guest', async () => {
    (guestsAPI.update as jest.Mock).mockResolvedValue(mockGuest);
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        guest={mockGuest}
      />,
    );

    await userEvent.clear(screen.getByLabelText(/first name/i));
    await userEvent.type(screen.getByLabelText(/first name/i), 'Updated');

    await userEvent.click(
      screen.getByRole('button', { name: /update guest/i }),
    );

    expect(guestsAPI.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        firstName: 'Updated',
      }),
    );
  });

  it('handles submission error when unknown error occurs', async () => {
    (guestsAPI.create as jest.Mock).mockRejectedValue('Unknown error');
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/first name/i), 'Fail');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Fail'); // Required
    await userEvent.click(
      screen.getByRole('button', { name: /create guest/i }),
    );

    await waitFor(() =>
      expect(screen.getByText('Failed to save guest')).toBeInTheDocument(),
    );
  });

  it('handles submission error with message', async () => {
    (guestsAPI.create as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(
      <GuestFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/first name/i), 'Fail');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Fail'); // Required
    await userEvent.click(
      screen.getByRole('button', { name: /create guest/i }),
    );

    await waitFor(() =>
      expect(screen.getByText('API Error')).toBeInTheDocument(),
    );
  });
});
