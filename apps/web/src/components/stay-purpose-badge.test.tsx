import { render, screen } from '@testing-library/react';
import { StayPurposeBadge, stayPurposeTone } from './stay-purpose-badge';
import { statusToneClass } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';

describe('StayPurposeBadge', () => {
  it('renders nothing for a standard stay', () => {
    const { container } = render(<StayPurposeBadge stayPurpose="STANDARD" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the complimentary label with the positive tone', () => {
    render(<StayPurposeBadge stayPurpose="COMPLIMENTARY" />);

    expect(
      screen.getByText(t('reservations.stayPurpose.badgeComp')),
    ).toHaveClass(...statusToneClass.positive.split(' '));
  });

  it('renders the house-use label with the neutral tone', () => {
    render(<StayPurposeBadge stayPurpose="HOUSE_USE" />);

    expect(
      screen.getByText(t('reservations.stayPurpose.badgeHouse')),
    ).toHaveClass(...statusToneClass.neutral.split(' '));
  });

  it('renders a compact size', () => {
    render(<StayPurposeBadge stayPurpose="HOUSE_USE" size="xs" />);

    expect(
      screen.getByText(t('reservations.stayPurpose.badgeHouse')),
    ).toHaveClass('text-2xs');
  });

  it('exposes the tone map', () => {
    expect(stayPurposeTone).toEqual({
      STANDARD: 'neutral',
      HOUSE_USE: 'neutral',
      COMPLIMENTARY: 'positive',
    });
  });
});
