import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyFormDialog } from './property-form-dialog';
import { propertiesAPI } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  propertiesAPI: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('PropertyFormDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockProperty = {
    id: '1',
    name: 'Existing Property',
    address: '123 Main St',
    phone: '555-1234',
    email: 'test@example.com',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty form for new property', () => {
    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('New Property')).toBeInTheDocument();
    expect(screen.getByLabelText(/property name/i)).toHaveValue('');
  });

  it('does not render when closed', () => {
    const { container } = render(
      <PropertyFormDialog
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('pre-fills form for existing property', () => {
    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        property={mockProperty}
      />,
    );

    expect(screen.getByText('Edit Property')).toBeInTheDocument();
    expect(screen.getByLabelText(/property name/i)).toHaveValue(
      'Existing Property',
    );
    expect(screen.getByLabelText(/address/i)).toHaveValue('123 Main St');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('555-1234');
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
  });

  it('creates new property on submit', async () => {
    (propertiesAPI.create as jest.Mock).mockResolvedValue({});

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/property name/i), 'New Hotel');
    await userEvent.type(screen.getByLabelText(/address/i), '123 New St');
    await userEvent.type(screen.getByLabelText(/phone/i), '123-456-7890');
    await userEvent.type(screen.getByLabelText(/email/i), 'hotel@test.com');
    await userEvent.click(
      screen.getByRole('button', { name: /create property/i }),
    );

    expect(propertiesAPI.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Hotel',
        address: '123 New St',
        phone: '123-456-7890',
        email: 'hotel@test.com',
      }),
    );
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('updates existing property on submit', async () => {
    (propertiesAPI.update as jest.Mock).mockResolvedValue({});

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        property={mockProperty}
      />,
    );

    const nameInput = screen.getByLabelText(/property name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Hotel');

    await userEvent.click(
      screen.getByRole('button', { name: /update property/i }),
    );

    expect(propertiesAPI.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        name: 'Updated Hotel',
      }),
    );
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays error message on failure', async () => {
    (propertiesAPI.create as jest.Mock).mockRejectedValue(
      new Error('Failed to create'),
    );

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/property name/i), 'Fail Hotel');
    await userEvent.click(
      screen.getByRole('button', { name: /create property/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to create')).toBeInTheDocument();
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles optional fields correctly when editing', () => {
    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        property={{
          ...mockProperty,
          address: undefined,
          phone: undefined,
          email: undefined,
        }}
      />,
    );

    expect(screen.getByLabelText(/address/i)).toHaveValue('');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('handles generic non-Error failures', async () => {
    (propertiesAPI.create as jest.Mock).mockRejectedValue('String Error');

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/property name/i), 'Fail Hotel');
    await userEvent.click(
      screen.getByRole('button', { name: /create property/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to save property')).toBeInTheDocument();
    });
  });
});
