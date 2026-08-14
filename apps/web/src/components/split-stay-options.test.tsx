import { render, screen, fireEvent } from '@testing-library/react';
import { SplitStayOptions } from './split-stay-options';

describe('SplitStayOptions', () => {
  it('toggles split stay and shows the split date field', () => {
    const onEnabledChange = vi.fn();
    const onSplitDateChange = vi.fn();

    const { rerender } = render(
      <SplitStayOptions
        enabled={false}
        disabled={false}
        splitDate="2026-08-16"
        minDate="2026-08-15"
        maxDate="2026-08-17"
        onEnabledChange={onEnabledChange}
        onSplitDateChange={onSplitDateChange}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Split stay' }));
    expect(onEnabledChange).toHaveBeenCalledWith(true);

    rerender(
      <SplitStayOptions
        enabled
        disabled={false}
        splitDate="2026-08-16"
        minDate="2026-08-15"
        maxDate="2026-08-17"
        onEnabledChange={onEnabledChange}
        onSplitDateChange={onSplitDateChange}
      />,
    );

    expect(screen.getByLabelText('Room change date')).toBeInTheDocument();
  });
});
