import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';

describe('Dialog', () => {
  it('renders all dialog components without crashing', () => {
    // We force open=true so the portal and content render immediately for coverage
    render(
      <Dialog open={true}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Body Content</div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    // Verify header, title, description, and footer components rendered
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
  });

  it('renders the content surface as an overlay panel', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Overlay</DialogTitle>
            <DialogDescription>Tokens</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toHaveClass(
      'rounded-xl',
      'shadow-overlay',
      'bg-popover',
      'text-popover-foreground',
      'border-border',
    );
    expect(screen.getByText('Overlay')).toHaveClass(
      'text-lg',
      'font-semibold',
      'text-ink-strong',
    );
    expect(screen.getByText('Tokens')).toHaveClass(
      'text-sm',
      'text-ink-subtle',
    );
  });

  it('gives the close control a focus-visible ring', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Closable</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
    );
    expect(close.className).not.toContain('focus:ring');
  });
});
