import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfirmDialog } from './confirm-dialog';

function TestComponent() {
  const { confirm, Dialog } = useConfirmDialog();

  return (
    <div>
      <button onClick={() => confirm('Test Title', 'Test Message', vi.fn())}>
        Open Dialog
      </button>
      {Dialog}
    </div>
  );
}

describe('useConfirmDialog', () => {
  it('should not render dialog initially', () => {
    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when confirm is called', async () => {
    const user = userEvent.setup();

    render(<TestComponent />);

    const openButton = screen.getByText('Open Dialog');
    await user.click(openButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    function TestComponentWithCallback() {
      const { confirm, Dialog } = useConfirmDialog();

      return (
        <div>
          <button
            onClick={() => confirm('Title', 'Message', onConfirm)}
            type="button"
          >
            Open
          </button>
          {Dialog}
        </div>
      );
    }

    render(<TestComponentWithCallback />);

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    function TestComponentWithCancel() {
      const { confirm, Dialog } = useConfirmDialog();

      return (
        <div>
          <button
            onClick={() => confirm('Title', 'Message', vi.fn(), { onCancel })}
            type="button"
          >
            Open
          </button>
          {Dialog}
        </div>
      );
    }

    render(<TestComponentWithCancel />);

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it('should use custom button text when provided', async () => {
    const user = userEvent.setup();

    function TestComponentCustomText() {
      const { confirm, Dialog } = useConfirmDialog();

      return (
        <div>
          <button
            onClick={() =>
              confirm('Title', 'Message', vi.fn(), {
                confirmText: 'Yes',
                cancelText: 'No',
              })
            }
            type="button"
          >
            Open
          </button>
          {Dialog}
        </div>
      );
    }

    render(<TestComponentCustomText />);

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  it('should close dialog after confirming', async () => {
    const user = userEvent.setup();

    render(<TestComponent />);

    await user.click(screen.getByText('Open Dialog'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should handle async onConfirm', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    function TestComponentAsync() {
      const { confirm, Dialog } = useConfirmDialog();

      return (
        <div>
          <button
            onClick={() => confirm('Title', 'Message', onConfirm)}
            type="button"
          >
            Open
          </button>
          {Dialog}
        </div>
      );
    }

    render(<TestComponentAsync />);

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('should handle cancel without onCancel callback', async () => {
    const user = userEvent.setup();

    render(<TestComponent />);

    await user.click(screen.getByText('Open Dialog'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should guard against double confirm clicks', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    function TestComponentDouble() {
      const { confirm, Dialog } = useConfirmDialog();

      return (
        <div>
          <button
            onClick={() => confirm('Title', 'Message', onConfirm)}
            type="button"
          >
            Open
          </button>
          {Dialog}
        </div>
      );
    }

    render(<TestComponentDouble />);

    await user.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm');
    // Simulate rapid double click
    await user.click(confirmButton);
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
