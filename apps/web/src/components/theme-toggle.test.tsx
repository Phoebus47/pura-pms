import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './theme-toggle';
import { useUIStore } from '@/lib/stores/use-ui-store';

vi.mock('zustand/middleware', () => ({
  persist: <T,>(fn: T) => fn,
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light' });
  });

  it('offers the dark appearance while light is active', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', {
      name: 'Switch to dark appearance',
    });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('Dark');
  });

  it('switches the stored theme when pressed', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole('button', { name: 'Switch to dark appearance' }),
    );

    expect(useUIStore.getState().theme).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light appearance' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps contrast affordances on the dark sidebar', () => {
    render(<ThemeToggle appearance="onDark" />);

    expect(
      screen.getByRole('button', { name: 'Switch to dark appearance' }),
    ).toHaveClass('text-white', 'min-h-11');
  });
});
