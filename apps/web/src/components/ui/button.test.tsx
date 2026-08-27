import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('meets the 44px interactive floor at the default size', () => {
    render(<Button>Post charge</Button>);
    expect(screen.getByRole('button', { name: 'Post charge' })).toHaveClass(
      'h-(--field-h)',
      'rounded-lg',
    );
  });

  it('keeps the icon size square on the field height', () => {
    render(<Button size="icon" aria-label="More actions" />);
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveClass(
      'h-(--field-h)',
      'w-(--field-h)',
    );
  });

  it('keeps compact and large sizes on their own heights', () => {
    const { rerender } = render(<Button size="sm">Sized</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">Sized</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('should apply variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'bg-destructive',
      'text-destructive-foreground',
    );
  });

  it('renders the primary variant on semantic action tokens', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      'bg-action-primary',
      'text-ink-onbrand',
    );
  });

  it('keeps the secondary variant on the orange signal token', () => {
    render(<Button variant="secondary">Alert</Button>);
    expect(screen.getByRole('button', { name: 'Alert' })).toHaveClass(
      'bg-signal',
      'text-ink-onbrand',
    );
  });

  it('keeps outline button text readable on a light surface', () => {
    render(<Button variant="outline">Show details</Button>);
    expect(screen.getByRole('button', { name: 'Show details' })).toHaveClass(
      'bg-surface-desk',
      'text-action-primary',
      'border-border',
    );
  });

  it('should render as child when asChild is true', () => {
    render(
      <Button asChild>
        <span role="link">Link Button</span>
      </Button>,
    );
    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('SPAN');
    expect(link).toHaveClass('inline-flex', 'h-(--field-h)');
  });
});
