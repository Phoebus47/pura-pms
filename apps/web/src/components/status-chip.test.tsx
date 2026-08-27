import { render, screen } from '@testing-library/react';
import { StatusChip } from './status-chip';
import { statusToneClass, type StatusTone } from '@/lib/design/status-tone';

describe('StatusChip', () => {
  const tones: StatusTone[] = [
    'positive',
    'caution',
    'critical',
    'info',
    'neutral',
    'brand',
  ];

  it.each(tones)('applies the %s tone classes', (tone) => {
    render(<StatusChip tone={tone} label={`${tone} label`} />);

    expect(screen.getByText(`${tone} label`)).toHaveClass(
      ...statusToneClass[tone].split(' '),
    );
  });

  it('renders the md size by default', () => {
    render(<StatusChip tone="info" label="Default" />);

    expect(screen.getByText('Default')).toHaveClass(
      'text-xs',
      'px-2.5',
      'py-1',
    );
  });

  it('renders the sm size', () => {
    render(<StatusChip tone="info" label="Compact" size="sm" />);

    expect(screen.getByText('Compact')).toHaveClass(
      'text-2xs',
      'px-2',
      'py-0.5',
    );
  });

  it('keeps the label on one line as a pill', () => {
    render(<StatusChip tone="neutral" label="Pill" />);

    expect(screen.getByText('Pill')).toHaveClass(
      'inline-flex',
      'items-center',
      'gap-1',
      'rounded-full',
      'ring-1',
      'ring-inset',
      'font-semibold',
      'whitespace-nowrap',
    );
  });

  it('renders an icon alongside the label', () => {
    render(
      <StatusChip
        tone="critical"
        label="Blocked"
        icon={<svg data-testid="chip-icon" />}
      />,
    );

    expect(screen.getByTestId('chip-icon')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('merges a custom className', () => {
    render(<StatusChip tone="brand" label="Custom" className="custom-class" />);

    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});
