import { render, screen } from '@testing-library/react';
import SettingsPage from './page';
import { t } from '@/lib/i18n';

describe('SettingsPage', () => {
  it('should render settings page', () => {
    render(<SettingsPage />);

    expect(screen.getByText(t('settings.title'))).toBeInTheDocument();
    expect(screen.getByText(t('settings.subtitle'))).toBeInTheDocument();
  });

  it('should show day-close and master data links', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
    expect(screen.getByText(t('settings.dayClose'))).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: new RegExp(t('settings.nightAudit')) }),
    ).toHaveAttribute('href', '/night-audit');
    expect(
      screen.getByRole('link', { name: new RegExp(t('settings.shifts')) }),
    ).toHaveAttribute('href', '/shifts');
    expect(
      screen.getByRole('link', { name: new RegExp(t('settings.reports')) }),
    ).toHaveAttribute('href', '/reports');
    expect(screen.getByText(t('settings.masterData'))).toBeInTheDocument();
    expect(
      screen.getByText(t('settings.transactionCodes')),
    ).toBeInTheDocument();
  });
});
