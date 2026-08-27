import { render, screen } from '@testing-library/react';
import { Badge } from './badge';
import { statusToneClass, type StatusTone } from '@/lib/design/status-tone';

const TONES: StatusTone[] = [
  'positive',
  'caution',
  'critical',
  'info',
  'neutral',
  'brand',
];

describe('Badge', () => {
  it('defaults to the neutral tone as a pill', () => {
    render(<Badge>Neutral</Badge>);
    const badge = screen.getByText('Neutral');
    expect(badge).toHaveClass(
      'rounded-full',
      'font-semibold',
      'ring-1',
      'ring-inset',
    );
    expect(badge).toHaveClass(...statusToneClass.neutral.split(' '));
  });

  it.each(TONES)('renders the %s tone classes', (tone) => {
    render(<Badge tone={tone}>{tone}</Badge>);
    expect(screen.getByText(tone)).toHaveClass(
      ...statusToneClass[tone].split(' '),
    );
  });

  it('renders the md size by default and the sm size on request', () => {
    const { rerender } = render(<Badge>Sized</Badge>);
    expect(screen.getByText('Sized')).toHaveClass('text-xs', 'px-2.5', 'py-1');

    rerender(<Badge size="sm">Sized</Badge>);
    expect(screen.getByText('Sized')).toHaveClass('text-2xs', 'px-2', 'py-0.5');
  });

  it.each([
    ['default', 'brand'],
    ['secondary', 'neutral'],
    ['destructive', 'critical'],
    ['outline', 'neutral'],
  ] as const)('maps the legacy %s variant to the %s tone', (variant, tone) => {
    render(<Badge variant={variant}>{variant}</Badge>);
    expect(screen.getByText(variant)).toHaveClass(
      ...statusToneClass[tone].split(' '),
    );
  });

  it('gives the legacy outline variant a visible border', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border', 'border-border');
  });

  it('uses focus-visible rather than focus for the focus ring', () => {
    render(<Badge>Focus</Badge>);
    const badge = screen.getByText('Focus');
    expect(badge).toHaveClass(
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
    );
    expect(badge.className).not.toContain('focus:');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});
