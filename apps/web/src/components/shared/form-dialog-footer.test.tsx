import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormDialogFooter } from './form-dialog-footer';
import { t } from '@/lib/i18n';

describe('FormDialogFooter', () => {
  it('should render cancel and submit buttons', () => {
    render(
      <FormDialogFooter
        onCancel={() => {}}
        loading={false}
        submitLabel="Save"
      />,
    );

    expect(screen.getByText(t('common.cancel'))).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <FormDialogFooter
        onCancel={handleCancel}
        loading={false}
        submitLabel="Save"
      />,
    );

    const cancelButton = screen.getByText(t('common.cancel'));
    await user.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when loading', () => {
    render(
      <FormDialogFooter
        onCancel={() => {}}
        loading={true}
        submitLabel="Save"
      />,
    );

    expect(screen.getByText(t('common.cancel'))).toBeDisabled();
    expect(screen.getByText(t('common.saving'))).toBeDisabled();
  });

  it('should show loading text when loading', () => {
    render(
      <FormDialogFooter
        onCancel={() => {}}
        loading={true}
        submitLabel="Save"
      />,
    );

    expect(screen.getByText(t('common.saving'))).toBeInTheDocument();
  });

  it('should support custom cancel label', () => {
    render(
      <FormDialogFooter
        onCancel={() => {}}
        loading={false}
        submitLabel="Save"
        cancelLabel="Close"
      />,
    );

    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
