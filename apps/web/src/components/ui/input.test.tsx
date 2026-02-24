import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders input correctly', () => {
    render(<Input placeholder="Enter text" type="text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });
});
