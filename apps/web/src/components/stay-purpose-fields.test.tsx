import { fireEvent, render, screen } from '@testing-library/react';
import { StayPurposeFields } from './stay-purpose-fields';
import { t } from '@/lib/i18n';

describe('StayPurposeFields', () => {
  it('renders the stay-type select', () => {
    const onChange = vi.fn();
    render(
      <StayPurposeFields
        stayPurpose="STANDARD"
        onStayPurposeChange={onChange}
        approvedBy=""
        onApprovedByChange={vi.fn()}
        stayPurposeNote=""
        onStayPurposeNoteChange={vi.fn()}
        department=""
        onDepartmentChange={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(t('reservations.stayPurpose.label')),
      {
        target: { value: 'COMPLIMENTARY' },
      },
    );
    expect(onChange).toHaveBeenCalledWith('COMPLIMENTARY');
  });

  it('shows authority fields for complimentary stays', () => {
    render(
      <StayPurposeFields
        stayPurpose="COMPLIMENTARY"
        onStayPurposeChange={vi.fn()}
        approvedBy=""
        onApprovedByChange={vi.fn()}
        stayPurposeNote=""
        onStayPurposeNoteChange={vi.fn()}
        department=""
        onDepartmentChange={vi.fn()}
        showAuthority
      />,
    );

    expect(
      screen.getByLabelText(`${t('reservations.stayPurpose.approvedBy')} *`),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(`${t('reservations.stayPurpose.department')} *`),
    ).not.toBeInTheDocument();
  });

  it('shows department for house-use stays', () => {
    render(
      <StayPurposeFields
        stayPurpose="HOUSE_USE"
        onStayPurposeChange={vi.fn()}
        approvedBy="GM"
        onApprovedByChange={vi.fn()}
        stayPurposeNote=""
        onStayPurposeNoteChange={vi.fn()}
        department=""
        onDepartmentChange={vi.fn()}
        showAuthority
      />,
    );

    expect(
      screen.getByLabelText(`${t('reservations.stayPurpose.department')} *`),
    ).toBeInTheDocument();
  });
});
