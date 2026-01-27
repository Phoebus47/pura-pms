import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './header';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Header', () => {
  it('should render search input', () => {
    render(<Header />);

    const searchInput = screen.getByLabelText(
      'Search guests, reservations, rooms',
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'search');
    expect(searchInput).toHaveAttribute('id', 'global-search');
    expect(searchInput).toHaveAttribute('name', 'search');
  });

  it('should render notifications button', () => {
    render(<Header />);

    const notificationsButton = screen.getByLabelText('Notifications');
    expect(notificationsButton).toBeInTheDocument();
  });

  it('should render user dropdown menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userButton = screen.getByText('Super Admin');
    expect(userButton).toBeInTheDocument();

    await user.click(userButton);

    expect(screen.getByText('admin@pura.com')).toBeInTheDocument();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Switch Property')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('should have accessible search input', () => {
    render(<Header />);

    const searchInput = screen.getByLabelText(
      'Search guests, reservations, rooms',
    );
    expect(searchInput).toHaveAttribute('aria-label');
  });
});
