import { render, screen } from '@testing-library/react';
import { SplitStayBadge, splitStayTone } from './split-stay-badge';
import { statusToneClass } from '@/lib/design/status-tone';

describe('SplitStayBadge', () => {
  it('renders the split stay label', () => {
    render(<SplitStayBadge />);
    expect(screen.getByText('Split stay')).toBeInTheDocument();
  });

  it('renders with the brand tone', () => {
    render(<SplitStayBadge />);
    expect(screen.getByText('Split stay')).toHaveClass(
      ...statusToneClass[splitStayTone].split(' '),
    );
  });

  it('renders a compact size', () => {
    render(<SplitStayBadge size="xs" />);
    expect(screen.getByText('Split stay')).toHaveClass('text-2xs');
  });

  it('should keep the label on one line', () => {
    render(<SplitStayBadge />);
    expect(screen.getByText('Split stay')).toHaveClass('whitespace-nowrap');
  });
});
