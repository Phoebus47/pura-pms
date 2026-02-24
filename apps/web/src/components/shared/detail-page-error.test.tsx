/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { DetailPageError } from './detail-page-error';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('DetailPageError', () => {
  const mockPush = vi.fn();
  const mockBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  it('should render title and message', () => {
    render(<DetailPageError title="Error Title" message="Error message" />);

    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should call router.back() when Go Back button is clicked', async () => {
    const user = userEvent.setup();

    render(<DetailPageError title="Error Title" message="Error message" />);

    const backButton = screen.getByText('Go Back');
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('should call custom onBack when provided', async () => {
    const handleBack = vi.fn();
    const user = userEvent.setup();

    render(
      <DetailPageError
        title="Error Title"
        message="Error message"
        onBack={handleBack}
      />,
    );

    const backButton = screen.getByText('Go Back');
    await user.click(backButton);

    expect(handleBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });
});
