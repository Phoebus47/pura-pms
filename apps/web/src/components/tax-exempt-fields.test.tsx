import { fireEvent, render, screen } from '@testing-library/react';
import { TaxExemptFields } from './tax-exempt-fields';
import { t } from '@/lib/i18n';

describe('TaxExemptFields', () => {
  it('toggles the tax-exempt checkbox', () => {
    const onChange = vi.fn();
    render(
      <TaxExemptFields
        taxExempt={false}
        onTaxExemptChange={onChange}
        taxExemptReason="DIPLOMATIC"
        onTaxExemptReasonChange={vi.fn()}
        taxExemptDocumentRef=""
        onTaxExemptDocumentRefChange={vi.fn()}
        taxExemptApprovedBy=""
        onTaxExemptApprovedByChange={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /tax-exempt stay/i,
      }),
    );
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows document fields when exempt', () => {
    render(
      <TaxExemptFields
        taxExempt
        onTaxExemptChange={vi.fn()}
        taxExemptReason="GOVERNMENT"
        onTaxExemptReasonChange={vi.fn()}
        taxExemptDocumentRef=""
        onTaxExemptDocumentRefChange={vi.fn()}
        taxExemptApprovedBy=""
        onTaxExemptApprovedByChange={vi.fn()}
        showDetails
      />,
    );

    expect(
      screen.getByLabelText(`${t('reservations.taxExempt.documentRef')} *`),
    ).toBeInTheDocument();
  });
});
