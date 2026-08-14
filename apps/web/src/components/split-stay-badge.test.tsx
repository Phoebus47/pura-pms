import { render, screen } from '@testing-library/react';
import { SplitStayBadge } from './split-stay-badge';

describe('SplitStayBadge', () => {
  it('renders the split stay label', () => {
    render(<SplitStayBadge />);
    expect(screen.getByText('Split stay')).toBeInTheDocument();
  });

  it('renders a compact size', () => {
    const { container } = render(<SplitStayBadge size="xs" />);
    expect(container.firstChild).toHaveClass('text-[10px]');
  });

  it('should keep the label on one line', () => {
    render(<SplitStayBadge />);
    expect(screen.getByText('Split stay')).toHaveClass('whitespace-nowrap');
  });
});
