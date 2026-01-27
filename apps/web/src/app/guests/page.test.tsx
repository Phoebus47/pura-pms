import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuestsPage from './page';
import { useGuests } from '@/hooks/use-guests';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-guests', () => ({
  useGuests: jest.fn(),
}));

const mockConfirm = jest.fn((title, msg, action) => action());
jest.mock('@/components/ui/confirm-dialog', () => ({
  useConfirmDialog: () => ({
    confirm: mockConfirm,
    Dialog: <div data-testid="confirm-dialog" />,
  }),
}));

// Mock child components to verify props
jest.mock('@/components/guest-form-dialog', () => ({
  GuestFormDialog: jest.fn(({ isOpen, guest, onSuccess }) =>
    isOpen ? (
      <div data-testid="guest-form-dialog">
        {guest ? `Edit ${guest.firstName}` : 'Create Guest'}
        <button onClick={onSuccess}>Success</button>
      </div>
    ) : null,
  ),
}));

const mockGuests = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '123',
    vipLevel: 1,
    totalStays: 2,
    totalRevenue: 500,
    isBlacklist: false,
    nationality: 'US',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    vipLevel: 0,
    totalStays: 0,
    totalRevenue: 0,
    isBlacklist: true,
  },
];

describe('GuestsPage', () => {
  const mockLoadGuests = jest.fn();
  const mockDeleteGuest = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useGuests as jest.Mock).mockReturnValue({
      guests: mockGuests,
      loading: false,
      error: null,
      loadGuests: mockLoadGuests,
      deleteGuest: mockDeleteGuest,
    });
  });

  it('renders loading state', () => {
    (useGuests as jest.Mock).mockReturnValue({
      loading: true,
      guests: [],
      loadGuests: mockLoadGuests,
    });
    render(<GuestsPage />);
    expect(screen.getByText('Loading guests...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useGuests as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Failed to fetch',
      guests: [],
      loadGuests: mockLoadGuests,
      loadGuestsRef: { current: mockLoadGuests },
    });
    render(<GuestsPage />);
    expect(screen.getByText('Error loading guests')).toBeInTheDocument();

    // Retry
    fireEvent.click(screen.getByText('Try Again'));
    expect(mockLoadGuests).toHaveBeenCalled();
  });

  it('renders empty state', () => {
    (useGuests as jest.Mock).mockReturnValue({
      guests: [],
      loading: false,
      loadGuests: mockLoadGuests,
    });
    render(<GuestsPage />);
    expect(screen.getByText('No guests found')).toBeInTheDocument();
  });

  it('renders guests list and handles row click', async () => {
    render(<GuestsPage />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Blacklisted')).toBeInTheDocument();

    // Row click navigation
    await userEvent.click(screen.getByText('John Doe'));
    expect(mockPush).toHaveBeenCalledWith('/guests/1');
  });

  it('searches guests', async () => {
    render(<GuestsPage />);
    const input = screen.getByPlaceholderText(/search/i);

    // Typing updates state
    await userEvent.type(input, 'John');

    // Click Search button (Call 2: Mount + Click)
    await userEvent.click(screen.getByText('Search', { selector: 'button' }));
    expect(mockLoadGuests).toHaveBeenCalled();

    // Enter key triggers search (Call 3: Mount + Click + Enter)
    await userEvent.clear(input);
    await userEvent.type(input, 'Doe{enter}');
    expect(mockLoadGuests).toHaveBeenCalledTimes(3);
  });

  it('opens create dialog', async () => {
    render(<GuestsPage />);
    await userEvent.click(screen.getByText('Add Guest'));

    expect(screen.getByText('Create Guest')).toBeInTheDocument();

    // Test Success callback
    await userEvent.click(screen.getByText('Success'));
    expect(mockLoadGuests).toHaveBeenCalled();
  });

  it('handles edit guest', async () => {
    render(<GuestsPage />);

    // Select John Doe's row details
    const row = screen.getByText('John Doe').closest('tr');
    if (!row) throw new Error('Row not found');

    // Actions are in the last cell (index 6)
    const actionsCell = within(row).getAllByRole('cell')[6];
    const editBtn = within(actionsCell).getAllByRole('button')[0];

    await userEvent.click(editBtn);

    expect(screen.getByText('Edit John')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled(); // Stop propagation
  });

  it('handles delete guest', async () => {
    render(<GuestsPage />);

    const row = screen.getByText('John Doe').closest('tr');
    if (!row) throw new Error('Row not found');

    const actionsCell = within(row).getAllByRole('cell')[6];
    const deleteBtn = within(actionsCell).getAllByRole('button')[1];

    await userEvent.click(deleteBtn);

    expect(mockConfirm).toHaveBeenCalled();
    // confirm is mocked to execute callback immediately
    expect(mockDeleteGuest).toHaveBeenCalledWith('1');
    expect(mockPush).not.toHaveBeenCalled();
  });
});
