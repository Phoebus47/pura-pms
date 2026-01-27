import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseFormDialog } from './base-form-dialog';

describe('BaseFormDialog', () => {
  it('should not render when isOpen is false', () => {
    render(
      <BaseFormDialog isOpen={false} onClose={() => {}} title="Test Dialog">
        <div>Content</div>
      </BaseFormDialog>,
    );

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <BaseFormDialog isOpen={true} onClose={() => {}} title="Test Dialog">
        <div>Content</div>
      </BaseFormDialog>,
    );

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <BaseFormDialog isOpen={true} onClose={handleClose} title="Test Dialog">
        <div>Content</div>
      </BaseFormDialog>,
    );

    const closeButton = screen.getByLabelText('Close dialog');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should render with different maxWidth values', () => {
    const { container, rerender } = render(
      <BaseFormDialog
        isOpen={true}
        onClose={() => {}}
        title="Test Dialog"
        maxWidth="md"
      >
        <div>Content</div>
      </BaseFormDialog>,
    );

    const dialogContainer = container.querySelector('.max-w-md');
    expect(dialogContainer).toBeInTheDocument();

    rerender(
      <BaseFormDialog
        isOpen={true}
        onClose={() => {}}
        title="Test Dialog"
        maxWidth="xl"
      >
        <div>Content</div>
      </BaseFormDialog>,
    );

    const xlDialog = container.querySelector('.max-w-xl');
    expect(xlDialog).toBeInTheDocument();
  });
});
