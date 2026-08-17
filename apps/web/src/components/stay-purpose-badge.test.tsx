import { render, screen } from '@testing-library/react';
import { StayPurposeBadge } from './stay-purpose-badge';
import { t } from '@/lib/i18n';

describe('StayPurposeBadge', () => {
  it('renders nothing for a standard stay', () => {
    const { container } = render(<StayPurposeBadge stayPurpose="STANDARD" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the complimentary label', () => {
    render(<StayPurposeBadge stayPurpose="COMPLIMENTARY" />);
    expect(
      screen.getByText(t('reservations.stayPurpose.badgeComp')),
    ).toBeInTheDocument();
  });

  it('renders the house-use label', () => {
    render(<StayPurposeBadge stayPurpose="HOUSE_USE" size="xs" />);
    expect(
      screen.getByText(t('reservations.stayPurpose.badgeHouse')),
    ).toBeInTheDocument();
  });
});
