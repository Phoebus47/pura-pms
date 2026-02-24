/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean },
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} alt={imgProps.alt || ''} />;
  },
}));

describe('Sidebar', () => {
  beforeEach(() => {
    (usePathname as any).mockReturnValue('/');
  });

  it('should render logo', () => {
    render(<Sidebar />);

    const logo = screen.getByAltText('PURA Logo');
    expect(logo).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reservations')).toBeInTheDocument();
    expect(screen.getByText('Guests')).toBeInTheDocument();
    expect(screen.getByText('Rooms')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    (usePathname as any).mockReturnValue('/reservations');

    render(<Sidebar />);

    const reservationsLink = screen.getByText('Reservations').closest('a');
    expect(reservationsLink).toHaveClass('bg-white/95');
  });

  it('should render version information', () => {
    render(<Sidebar />);

    expect(screen.getByText('PURA PMS')).toBeInTheDocument();
    expect(screen.getByText(/v1.0.0/)).toBeInTheDocument();
  });

  it('should be hidden on mobile', () => {
    const { container } = render(<Sidebar />);

    const sidebar = container.querySelector('div');
    expect(sidebar).toHaveClass('hidden', 'md:flex');
  });
});
