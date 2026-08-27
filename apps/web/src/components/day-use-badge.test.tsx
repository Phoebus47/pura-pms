import { render, screen } from '@testing-library/react';
import { DayUseBadge, dayUseTone } from './day-use-badge';
import { statusToneClass } from '@/lib/design/status-tone';

describe('DayUseBadge', () => {
  it('renders the day-use label', () => {
    render(<DayUseBadge />);
    expect(screen.getByText('Day use')).toBeInTheDocument();
  });

  it('renders with the caution tone', () => {
    render(<DayUseBadge />);
    expect(screen.getByText('Day use')).toHaveClass(
      ...statusToneClass[dayUseTone].split(' '),
    );
  });

  it('applies the xs size classes', () => {
    render(<DayUseBadge size="xs" />);
    expect(screen.getByText('Day use')).toHaveClass(
      'px-2',
      'py-0.5',
      'text-2xs',
    );
  });

  it('applies a custom className', () => {
    render(<DayUseBadge className="custom-class" />);
    expect(screen.getByText('Day use')).toHaveClass('custom-class');
  });

  it('should keep the label on one line', () => {
    render(<DayUseBadge />);
    expect(screen.getByText('Day use')).toHaveClass('whitespace-nowrap');
  });
});
