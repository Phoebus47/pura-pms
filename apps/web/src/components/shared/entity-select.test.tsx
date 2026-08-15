import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntitySelect } from './entity-select';
import { t } from '@/lib/i18n';

describe('EntitySelect', () => {
  it('renders a labeled native select and reports the chosen value', async () => {
    const onChange = vi.fn();
    render(
      <EntitySelect
        id="folioId"
        name="folioId"
        label={t('taxInvoice.folioId')}
        value=""
        onChange={onChange}
        options={[{ value: 'f1', label: 'F000001 · John Doe' }]}
        required
      />,
    );

    const select = screen.getByLabelText(t('taxInvoice.folioId'));
    expect(select).toBeRequired();
    await userEvent.selectOptions(select, 'f1');
    expect(onChange).toHaveBeenCalledWith('f1');
  });
});
