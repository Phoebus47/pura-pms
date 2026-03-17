import { render, screen } from '@testing-library/react';
import SettingsPage from './page';

describe('SettingsPage', () => {
  it('should render settings page', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(
      screen.getByText(/manage your account and preferences/i),
    ).toBeInTheDocument();
  });

  it('should show master data section', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Master Data')).toBeInTheDocument();
    expect(screen.getByText('Transaction Codes')).toBeInTheDocument();
  });
});
