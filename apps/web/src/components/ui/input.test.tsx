import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders input correctly', () => {
    render(<Input placeholder="Enter text" type="text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(
      'bg-surface-desk',
      'text-foreground',
      'scheme-light',
    );
  });
});
