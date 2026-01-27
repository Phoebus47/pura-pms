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

  it('should display coming soon message', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Settings Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/under development/i)).toBeInTheDocument();
  });
});
