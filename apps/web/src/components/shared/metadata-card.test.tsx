import { render, screen } from '@testing-library/react';
import { MetadataCard } from './metadata-card';
import { t } from '@/lib/i18n';

describe('MetadataCard', () => {
  it('should render created and updated dates', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const updatedAt = new Date('2024-01-02T00:00:00Z');

    render(<MetadataCard createdAt={createdAt} updatedAt={updatedAt} />);

    expect(
      screen.getByText(new RegExp(`${t('common.created')}:`)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${t('common.lastUpdated')}:`)),
    ).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    const createdAt = new Date('2024-01-01T10:30:00Z');
    const updatedAt = new Date('2024-01-02T15:45:00Z');

    render(<MetadataCard createdAt={createdAt} updatedAt={updatedAt} />);

    const createdText = screen.getByText(
      new RegExp(`${t('common.created')}:`),
    ).textContent;
    const updatedText = screen.getByText(
      new RegExp(`${t('common.lastUpdated')}:`),
    ).textContent;

    expect(createdText).toContain(`${t('common.created')}:`);
    expect(updatedText).toContain(`${t('common.lastUpdated')}:`);
  });

  it('should accept string dates', () => {
    render(
      <MetadataCard
        createdAt="2024-01-01T00:00:00Z"
        updatedAt="2024-01-02T00:00:00Z"
      />,
    );

    expect(
      screen.getByText(new RegExp(`${t('common.created')}:`)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${t('common.lastUpdated')}:`)),
    ).toBeInTheDocument();
  });
});
