import { render } from '@testing-library/react';
import { Toaster } from './toast';

vi.mock('sonner', () => ({
  Toaster: vi.fn(() => <div data-testid="sonner-toaster" />),
}));

describe('Toaster', () => {
  it('should render Toaster component', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('sonner-toaster')).toBeInTheDocument();
  });
});
