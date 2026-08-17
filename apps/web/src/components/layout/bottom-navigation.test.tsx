/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { BottomNavigation } from './bottom-navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('BottomNavigation', () => {
  beforeEach(() => {
    (usePathname as any).mockReturnValue('/');
  });

  it('should render primary navigation items including Billing', () => {
    render(<BottomNavigation />);

    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Reservations')).toBeInTheDocument();
    expect(screen.getByLabelText('Guests')).toBeInTheDocument();
    expect(screen.getByLabelText('Rooms')).toBeInTheDocument();
    expect(screen.getByLabelText('Billing')).toBeInTheDocument();
  });

  it('should keep Shifts, Reports and Settings out of the primary bar', () => {
    render(<BottomNavigation />);

    expect(
      screen.queryByRole('link', { name: 'Shifts' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Reports' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Settings' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('More')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    (usePathname as any).mockReturnValue('/reservations');

    render(<BottomNavigation />);

    const reservationsLink = screen.getByLabelText('Reservations');
    expect(reservationsLink).toHaveClass('text-pura-blue');
  });

  it('should highlight More when a overflow destination is active', () => {
    (usePathname as any).mockReturnValue('/reports');

    render(<BottomNavigation />);

    expect(screen.getByLabelText('More')).toHaveClass('text-pura-blue');
  });

  it('should open Shifts, Reports and Settings from the More menu', async () => {
    const user = userEvent.setup();
    render(<BottomNavigation />);

    await user.click(screen.getByLabelText('More'));

    expect(
      screen.getByRole('menuitem', { name: /Shifts/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /Night Audit/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /Reports/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /Settings/ }),
    ).toBeInTheDocument();
  });

  it('should be visible only below the desktop breakpoint', () => {
    const { container } = render(<BottomNavigation />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('lg:hidden');
    expect(nav).not.toHaveClass('md:hidden');
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
