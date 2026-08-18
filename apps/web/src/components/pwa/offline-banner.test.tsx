import { render, screen } from '@testing-library/react';
import { OfflineBanner } from './offline-banner';
import { t } from '@/lib/i18n';

describe('OfflineBanner', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('is hidden when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    render(<OfflineBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the offline message when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    render(<OfflineBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(
      t('pwa.offlineBanner'),
    );
  });
});
