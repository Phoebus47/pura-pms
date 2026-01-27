import { render, screen } from '@testing-library/react';
import BillingPage from './page';

describe('BillingPage', () => {
  it('should render billing page', () => {
    render(<BillingPage />);

    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(
      screen.getByText(/manage invoices and payments/i),
    ).toBeInTheDocument();
  });

  it('should display coming soon message', () => {
    render(<BillingPage />);

    expect(screen.getByText('Billing Module Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/under development/i)).toBeInTheDocument();
  });
});
