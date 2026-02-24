/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuestSearchDialog } from './guest-search-dialog';
import { guestsAPI } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  guestsAPI: {
    getAll: vi.fn(),
  },
}));

describe('GuestSearchDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectGuest = vi.fn();
  const mockOnCreateNew = vi.fn();
  const mockGuests = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      totalStays: 2,
      totalRevenue: 5000,
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      totalStays: 1,
      totalRevenue: 2500,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input when open', () => {
    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <GuestSearchDialog
        isOpen={false}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    expect(
      screen.queryByPlaceholderText(/search by name/i),
    ).not.toBeInTheDocument();
  });

  it('searches for guests on button click', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: mockGuests });

    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    const input = screen.getByPlaceholderText(/search by name/i);
    await userEvent.type(input, 'John');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    expect(guestsAPI.getAll).toHaveBeenCalledWith({ search: 'John' });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('searches for guests on Enter key', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: mockGuests });

    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    const input = screen.getByPlaceholderText(/search by name/i);
    await userEvent.type(input, 'John{enter}');

    expect(guestsAPI.getAll).toHaveBeenCalledWith({ search: 'John' });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('displays no guests found message', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: [] });

    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    const input = screen.getByPlaceholderText(/search by name/i);
    await userEvent.type(input, 'Unknown');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('No guests found')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /create new guest/i }),
    ).toBeInTheDocument();
  });

  it('selects a guest on click', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({
      data: [mockGuests[0]],
    });

    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/search by name/i),
      'John',
    );
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('John Doe'));

    expect(mockOnSelectGuest).toHaveBeenCalledWith(mockGuests[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls create new handler', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({ data: [] });

    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/search by name/i),
      'Unknown',
    );
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      const createButton = screen.getByRole('button', {
        name: /create new guest/i,
      });
      fireEvent.click(createButton);
    });

    expect(mockOnCreateNew).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles API error', async () => {
    (guestsAPI.getAll as any).mockRejectedValue(new Error('API Error'));
    // Mock toast to check call or just ensure no crash
    // Since toast is imported from @/lib/toast, we should probably mock it if testing strictly,
    // but here we just ensure loading state clears.

    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/search by name/i),
      'Error',
    );
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /search/i }),
      ).not.toBeDisabled();
    });
  });

  it('does not search if term is empty or whitespace', async () => {
    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    const input = screen.getByPlaceholderText(/search by name/i);
    await userEvent.type(input, '   {enter}');

    expect(guestsAPI.getAll).not.toHaveBeenCalled();
  });

  it('renders guest with no contact info', async () => {
    (guestsAPI.getAll as any).mockResolvedValue({
      data: [
        {
          ...mockGuests[0],
          email: null,
          phone: null,
        },
      ],
    });

    render(
      <GuestSearchDialog
        isOpen={true}
        onClose={mockOnClose}
        onSelectGuest={mockOnSelectGuest}
        onCreateNew={mockOnCreateNew}
      />,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/search by name/i),
      'John',
    );
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('No contact info')).toBeInTheDocument();
    });
  });
});
