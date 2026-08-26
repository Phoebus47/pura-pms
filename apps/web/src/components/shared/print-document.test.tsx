import { render, screen } from '@testing-library/react';
import { t } from '@/lib/i18n';
import { PRINT_DOCUMENT_CLASS } from '@/lib/fonts.constants';
import { PrintDocument } from './print-document';

describe('PrintDocument', () => {
  it('exposes a labeled article that keeps the print font class', () => {
    render(
      <PrintDocument>
        <h1>Invoice</h1>
      </PrintDocument>,
    );

    const document = screen.getByRole('article', {
      name: t('print.documentLabel'),
    });
    expect(document).toHaveClass(PRINT_DOCUMENT_CLASS);
    expect(
      screen.getByRole('heading', { name: 'Invoice' }),
    ).toBeInTheDocument();
  });
});
