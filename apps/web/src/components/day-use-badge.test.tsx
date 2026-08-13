import { render, screen } from '@testing-library/react';
import { DayUseBadge } from './day-use-badge';

describe('DayUseBadge', () => {
  it('renders the day-use label', () => {
    render(<DayUseBadge />);
    expect(screen.getByText('Day use')).toBeInTheDocument();
  });

  it('applies the xs size classes', () => {
    render(<DayUseBadge size="xs" />);
    expect(screen.getByText('Day use')).toHaveClass(
      'px-1.5',
      'py-0.5',
      'text-[10px]',
    );
  });

  it('applies a custom className', () => {
    render(<DayUseBadge className="custom-class" />);
    expect(screen.getByText('Day use')).toHaveClass('custom-class');
  });
});
