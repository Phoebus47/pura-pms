import { render, screen } from '@testing-library/react';
import ReportsPage from './page';

describe('ReportsPage', () => {
  it('should render reports page', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText(/view and generate reports/i)).toBeInTheDocument();
  });

  it('should display coming soon message', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Reports Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/under development/i)).toBeInTheDocument();
  });
});
