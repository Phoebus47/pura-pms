import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { BottomNavigation } from './bottom-navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('BottomNavigation', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('should render navigation items', () => {
    render(<BottomNavigation />);

    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Reservations')).toBeInTheDocument();
    expect(screen.getByLabelText('Guests')).toBeInTheDocument();
    expect(screen.getByLabelText('Rooms')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    (usePathname as jest.Mock).mockReturnValue('/reservations');

    render(<BottomNavigation />);

    const reservationsLink = screen.getByLabelText('Reservations');
    expect(reservationsLink).toHaveClass('text-[#1e4b8e]');
  });

  it('should be visible only on mobile', () => {
    const { container } = render(<BottomNavigation />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('md:hidden');
  });

  it('should have fixed position at bottom', () => {
    const { container } = render(<BottomNavigation />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('fixed', 'bottom-0');
  });

  it('should have accessible labels for navigation items', () => {
    render(<BottomNavigation />);

    const dashboardLink = screen.getByLabelText('Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('aria-label', 'Dashboard');
  });
});
