/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Mock ResizeObserver for Radix UI
if (typeof window !== 'undefined') {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

describe('Select', () => {
  it('renders all select components and handles interaction', async () => {
    render(
      <Select>
        <SelectTrigger aria-label="options">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectScrollUpButton />
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectSeparator />
            <SelectItem value="orange">Orange</SelectItem>
          </SelectGroup>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>,
    );

    // Initial render check
    expect(screen.getByText('Select an option')).toBeInTheDocument();

    // Click trigger to open content
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);

    // Verify content rendered
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();
  });
});
