import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BillingPage from './page';

vi.mock('./billing-client', () => ({
  BillingClient: () => <div data-testid="billing-dashboard">Dashboard</div>,
}));

describe('BillingPage', () => {
  it('renders billing dashboard inside suspense', () => {
    render(<BillingPage />);

    expect(screen.getByTestId('billing-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
