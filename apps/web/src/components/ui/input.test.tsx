import { render, screen } from '@testing-library/react';
import { Input } from './input';
import { Textarea } from './textarea';

const SHARED_FOCUS = [
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
];

describe('Input', () => {
  it('renders input correctly', () => {
    render(<Input placeholder="Enter text" type="text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(
      'bg-surface-desk',
      'text-foreground',
      'scheme-light',
      'border-input',
    );
  });

  it('sits on the field height with the control radius', () => {
    render(<Input aria-label="Guest name" />);
    expect(screen.getByLabelText('Guest name')).toHaveClass(
      'h-(--field-h)',
      'rounded-md',
    );
  });

  it('uses the shared focus treatment and placeholder ink', () => {
    render(<Input aria-label="Guest name" />);
    const input = screen.getByLabelText('Guest name');
    expect(input).toHaveClass(...SHARED_FOCUS);
    expect(input).toHaveClass('placeholder:text-ink-disabled');
  });
});

describe('Textarea', () => {
  it('keeps a min-height and the shared field treatment', () => {
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea).toHaveClass(
      'min-h-20',
      'rounded-md',
      'bg-surface-desk',
      'border-input',
      'scheme-light',
      'placeholder:text-ink-disabled',
    );
    expect(textarea).toHaveClass(...SHARED_FOCUS);
  });
});
