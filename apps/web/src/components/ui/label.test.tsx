import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders label correctly', () => {
    render(<Label htmlFor="test-id">Email address</Label>);
    const label = screen.getByText('Email address');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('text-foreground');
  });
});
