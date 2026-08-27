import { render, screen } from '@testing-library/react';
import { TaxExemptBadge, taxExemptTone } from './tax-exempt-badge';
import { statusToneClass } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';

describe('TaxExemptBadge', () => {
  const label = t('reservations.taxExempt.badge');

  it('renders nothing when the reservation is not tax exempt', () => {
    const { container } = render(<TaxExemptBadge taxExempt={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the tax-exempt label with the caution tone', () => {
    render(<TaxExemptBadge taxExempt />);

    expect(screen.getByText(label)).toHaveClass(
      ...statusToneClass[taxExemptTone].split(' '),
    );
  });

  it('applies a custom className', () => {
    render(<TaxExemptBadge taxExempt className="custom-class" />);

    expect(screen.getByText(label)).toHaveClass('custom-class');
  });
});
