import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { DetailPageHeader } from './detail-page-header';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('DetailPageHeader', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  it('should render title', () => {
    render(<DetailPageHeader title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render subtitle as string', () => {
    render(<DetailPageHeader title="Test Title" subtitle="Test Subtitle" />);

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render subtitle as ReactNode', () => {
    render(
      <DetailPageHeader
        title="Test Title"
        subtitle={<span>Custom Subtitle</span>}
      />,
    );

    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });

  it('should call router.back() when Back button is clicked', async () => {
    const user = userEvent.setup();

    render(<DetailPageHeader title="Test Title" />);

    const backButton = screen.getByText('Back');
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('should call custom onBack when provided', async () => {
    const handleBack = jest.fn();
    const user = userEvent.setup();

    render(<DetailPageHeader title="Test Title" onBack={handleBack} />);

    const backButton = screen.getByText('Back');
    await user.click(backButton);

    expect(handleBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('should render actions', () => {
    render(
      <DetailPageHeader
        title="Test Title"
        actions={<button>Action Button</button>}
      />,
    );

    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});
