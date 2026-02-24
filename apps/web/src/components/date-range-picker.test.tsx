import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from './date-range-picker';

describe('DateRangePicker', () => {
  const mockOnCheckInChange = vi.fn();
  const mockOnCheckOutChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render check-in and check-out date inputs', () => {
    render(
      <DateRangePicker
        checkIn=""
        checkOut=""
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    expect(screen.getByLabelText('Check-in Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Check-out Date')).toBeInTheDocument();
  });

  it('should display selected dates', () => {
    render(
      <DateRangePicker
        checkIn="2024-01-15"
        checkOut="2024-01-20"
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    const checkInInput = screen.getByLabelText(
      'Check-in Date',
    ) as HTMLInputElement;
    const checkOutInput = screen.getByLabelText(
      'Check-out Date',
    ) as HTMLInputElement;

    expect(checkInInput.value).toBe('2024-01-15');
    expect(checkOutInput.value).toBe('2024-01-20');
  });

  it('should call onCheckInChange when check-in date changes', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        checkIn=""
        checkOut=""
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    const checkInInput = screen.getByLabelText('Check-in Date');
    await user.type(checkInInput, '2024-01-15');

    expect(mockOnCheckInChange).toHaveBeenCalled();
  });

  it('should call onCheckOutChange when check-out date changes', async () => {
    const user = userEvent.setup();

    render(
      <DateRangePicker
        checkIn="2024-01-15"
        checkOut=""
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    const checkOutInput = screen.getByLabelText('Check-out Date');
    await user.type(checkOutInput, '2024-01-20');

    expect(mockOnCheckOutChange).toHaveBeenCalled();
  });

  it('should auto-adjust check-out date if it is before check-in date', () => {
    render(
      <DateRangePicker
        checkIn="2024-01-15"
        checkOut="2024-01-20"
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    const checkInInput = screen.getByLabelText('Check-in Date');
    fireEvent.change(checkInInput, { target: { value: '2024-01-25' } });

    expect(mockOnCheckOutChange).toHaveBeenCalledWith('2024-01-26');
  });

  it('should display nights count when both dates are selected', () => {
    render(
      <DateRangePicker
        checkIn="2024-01-15"
        checkOut="2024-01-20"
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    expect(screen.getByText('5 nights')).toBeInTheDocument();
  });

  it('should display singular "night" for 1 night', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    render(
      <DateRangePicker
        checkIn={tomorrow.toISOString().split('T')[0]}
        checkOut={dayAfter.toISOString().split('T')[0]}
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    expect(screen.getByText('1 night')).toBeInTheDocument();
  });

  it('should not display nights count when dates are not selected', () => {
    render(
      <DateRangePicker
        checkIn=""
        checkOut=""
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    expect(screen.queryByText(/night/)).not.toBeInTheDocument();
  });

  it('should respect minDate prop', () => {
    render(
      <DateRangePicker
        checkIn=""
        checkOut=""
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
        minDate="2024-01-10"
      />,
    );

    const checkInInput = screen.getByLabelText(
      'Check-in Date',
    ) as HTMLInputElement;
    expect(checkInInput.min).toBe('2024-01-10');
  });

  it('should set check-out min date to check-in date', () => {
    render(
      <DateRangePicker
        checkIn="2024-01-15"
        checkOut=""
        onCheckInChange={mockOnCheckInChange}
        onCheckOutChange={mockOnCheckOutChange}
      />,
    );

    const checkOutInput = screen.getByLabelText(
      'Check-out Date',
    ) as HTMLInputElement;
    expect(checkOutInput.min).toBe('2024-01-15');
  });
});
