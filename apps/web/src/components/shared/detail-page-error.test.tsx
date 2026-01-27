import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { DetailPageError } from './detail-page-error';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('DetailPageError', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
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
    const handleBack = jest.fn();
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
