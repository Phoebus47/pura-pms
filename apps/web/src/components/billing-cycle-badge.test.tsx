import { render, screen } from '@testing-library/react';
import { BillingCycleBadge, billingCycleTone } from './billing-cycle-badge';
import { statusToneClass } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';

describe('BillingCycleBadge', () => {
  it('renders nothing for a nightly billing cycle', () => {
    const { container } = render(<BillingCycleBadge billingCycle="NIGHTLY" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the weekly label with the info tone', () => {
    render(<BillingCycleBadge billingCycle="WEEKLY" />);

    expect(
      screen.getByText(t('reservations.billingCycle.badgeWeekly')),
    ).toHaveClass(...statusToneClass[billingCycleTone.WEEKLY].split(' '));
  });

  it('renders the monthly label with the info tone', () => {
    render(<BillingCycleBadge billingCycle="MONTHLY" />);

    expect(
      screen.getByText(t('reservations.billingCycle.badgeMonthly')),
    ).toHaveClass(...statusToneClass[billingCycleTone.MONTHLY].split(' '));
  });

  it('applies a custom className', () => {
    render(
      <BillingCycleBadge billingCycle="WEEKLY" className="custom-class" />,
    );

    expect(
      screen.getByText(t('reservations.billingCycle.badgeWeekly')),
    ).toHaveClass('custom-class');
  });
});
