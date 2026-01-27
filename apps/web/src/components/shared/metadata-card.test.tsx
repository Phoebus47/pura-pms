import { render, screen } from '@testing-library/react';
import { MetadataCard } from './metadata-card';

describe('MetadataCard', () => {
  it('should render created and updated dates', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const updatedAt = new Date('2024-01-02T00:00:00Z');

    render(<MetadataCard createdAt={createdAt} updatedAt={updatedAt} />);

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    const createdAt = new Date('2024-01-01T10:30:00Z');
    const updatedAt = new Date('2024-01-02T15:45:00Z');

    render(<MetadataCard createdAt={createdAt} updatedAt={updatedAt} />);

    const createdText = screen.getByText(/Created:/).textContent;
    const updatedText = screen.getByText(/Last Updated:/).textContent;

    expect(createdText).toContain('Created:');
    expect(updatedText).toContain('Last Updated:');
  });

  it('should accept string dates', () => {
    render(
      <MetadataCard
        createdAt="2024-01-01T00:00:00Z"
        updatedAt="2024-01-02T00:00:00Z"
      />,
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });
});
