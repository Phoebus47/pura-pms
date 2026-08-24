/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuestsPage from './page';
import { useGuests } from '@/hooks/use-guests';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/use-guests', () => ({
  useGuests: vi.fn(),
}));

const mockConfirm = vi.fn((title, msg, action) => action());
vi.mock('@/components/ui/confirm-dialog', () => ({
  useConfirmDialog: () => ({
    confirm: mockConfirm,
    Dialog: <div data-testid="confirm-dialog" />,
  }),
}));

// Mock child components to verify props
vi.mock('@/components/guest-form-dialog', () => ({
  GuestFormDialog: vi.fn(({ isOpen, guest, onSuccess, onClose }) =>
    isOpen ? (
      <div data-testid="guest-form-dialog">
        {guest ? `Edit ${guest.firstName}` : 'Create Guest'}
        <button onClick={onSuccess}>Success</button>
        <button onClick={onClose}>Close</button>
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
  const mockLoadGuests = vi.fn();
  const mockDeleteGuest = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useGuests as any).mockReturnValue({
      guests: mockGuests,
      loading: false,
      error: null,
      loadGuests: mockLoadGuests,
      deleteGuest: mockDeleteGuest,
    });
  });

  it('renders loading state', () => {
    (useGuests as any).mockReturnValue({
      loading: true,
      guests: [],
      loadGuests: mockLoadGuests,
    });
    render(<GuestsPage />);
    expect(screen.getByText('Loading guests...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useGuests as any).mockReturnValue({
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
    (useGuests as any).mockReturnValue({
      guests: [],
      loading: false,
      loadGuests: mockLoadGuests,
    });
    render(<GuestsPage />);
    expect(screen.getByText('No guests found')).toBeInTheDocument();
  });

  it('renders empty state with search query', async () => {
    (useGuests as any).mockReturnValue({
      guests: [],
      loading: false,
      loadGuests: mockLoadGuests,
    });
    const user = userEvent.setup();
    render(<GuestsPage />);
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'TestSearchQuery');

    // We expect the 'Try a different search term' message to appear
    await waitFor(() => {
      expect(
        screen.getByText('Try a different search term'),
      ).toBeInTheDocument();
    });
  });

  it('renders guests list with fallback for missing email and handles row click', async () => {
    const guestsWithMissingEmail = [{ ...mockGuests[0], email: null }];
    (useGuests as any).mockReturnValue({
      guests: guestsWithMissingEmail,
      loading: false,
      error: null,
      loadGuests: mockLoadGuests,
      deleteGuest: mockDeleteGuest,
    });

    render(<GuestsPage />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Check fallback character for email
    const fallbackTextElements = screen.getAllByText('-');
    expect(fallbackTextElements.length).toBeGreaterThan(0);
  });

  it('renders guests list and handles row click', async () => {
    (useGuests as any).mockReturnValue({
      guests: mockGuests,
      loading: false,
      error: null,
      loadGuests: mockLoadGuests,
      deleteGuest: mockDeleteGuest,
    });
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

    // Test Close callback
    await userEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('Create Guest')).not.toBeInTheDocument();
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
