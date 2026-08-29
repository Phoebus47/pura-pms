import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DensityToggle } from './density-toggle';
import { useUIStore } from '@/lib/stores/use-ui-store';
import { t } from '@/lib/i18n';

vi.mock('zustand/middleware', () => ({
  persist: <T,>(fn: T) => fn,
}));

describe('DensityToggle', () => {
  beforeEach(() => {
    useUIStore.setState({ tableDensity: 'default' });
  });

  it('offers compact density while comfortable is active', () => {
    render(<DensityToggle />);

    const button = screen.getByRole('button', {
      name: t('density.switchToCompact'),
    });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent(t('density.comfortable'));
  });

  it('switches the stored density when pressed', async () => {
    const user = userEvent.setup();
    render(<DensityToggle />);

    await user.click(
      screen.getByRole('button', { name: t('density.switchToCompact') }),
    );

    expect(useUIStore.getState().tableDensity).toBe('compact');
    expect(
      screen.getByRole('button', { name: t('density.switchToComfortable') }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps contrast affordances on the dark sidebar', () => {
    render(<DensityToggle appearance="onDark" />);

    expect(
      screen.getByRole('button', { name: t('density.switchToCompact') }),
    ).toHaveClass('text-white', 'min-h-11');
  });
});
