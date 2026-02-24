import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders label correctly', () => {
    render(<Label htmlFor="test-id">Email address</Label>);
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });
});
