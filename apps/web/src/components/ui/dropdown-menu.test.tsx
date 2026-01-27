import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from './dropdown-menu';
import React from 'react';

describe('DropdownMenu', () => {
  it('opens and closes on click', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByText('Open');
    await userEvent.click(trigger);
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // Click outside to close (simulating overlay click or body click)
    // Skip pointer events check because Radix overlay might block body
    await userEvent.click(document.body, { pointerEventsCheck: 0 });

    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  it('navigates with keyboard', async () => {
    const onSelect = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByText('Open');
    trigger.focus();
    await userEvent.keyboard('{Enter}'); // Open menu

    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // Verify first item is highlighted by default or after interaction
    const item = screen.getByText('Item 1');
    await waitFor(() => expect(item).toHaveAttribute('data-highlighted'));

    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalled();
  });

  it('respects disabled items', async () => {
    const onSelect = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Disabled Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));
    const item = screen.getByText('Disabled Item');

    await userEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  it('renders submenus', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>SubItem 1</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await userEvent.click(screen.getByText('Open'));

    // Hover or click subtrigger to open submenu
    // Radix UI submenus open on hover or pointer interaction.
    // For test env, we might need to click or focus.
    await userEvent.click(screen.getByText('Submenu'));

    expect(screen.getByText('SubItem 1')).toBeVisible();
  });

  it('toggles checkbox items', async () => {
    const TestComponent = () => {
      const [checked, setChecked] = React.useState(false);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
            >
              Check Me
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };
    // Need React import
    render(<TestComponent />);

    await userEvent.click(screen.getByText('Open'));
    const item = screen.getByRole('menuitemcheckbox');
    expect(item).not.toBeChecked();

    await userEvent.click(item);

    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('menuitemcheckbox')).toBeChecked();
  });

  it('renders complex menu with radio items, groups, and shortcuts', async () => {
    const TestComponent = () => {
      const [color, setColor] = React.useState('blue');
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Colors</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={color} onValueChange={setColor}>
                <DropdownMenuRadioItem value="blue">
                  Blue <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="red">Red</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };
    render(<TestComponent />);

    await userEvent.click(screen.getByText('Open'));

    // Check Radio Group and Item
    const blueItem = screen.getByRole('menuitemradio', { name: /blue/i });
    const redItem = screen.getByRole('menuitemradio', { name: /red/i });

    // Check Shortcut
    expect(screen.getByText('⌘B')).toBeInTheDocument();

    // Verify Blue is checked (default)
    expect(blueItem).toHaveAttribute('aria-checked', 'true');
    expect(redItem).toHaveAttribute('aria-checked', 'false');

    // Click Red
    await userEvent.click(redItem);

    // Re-open
    await userEvent.click(screen.getByText('Open'));

    // Verify Red is checked
    expect(
      screen.getByRole('menuitemradio', { name: /blue/i }),
    ).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemradio', { name: /red/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('applies inset styles', async () => {
    const TestComponent = () => (
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Label</DropdownMenuLabel>
          <DropdownMenuItem inset>Item</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>SubTrigger</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>SubItem</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    render(<TestComponent />);

    await userEvent.click(screen.getByText('Open'));

    const label = screen.getByText('Label');
    expect(label).toHaveClass('pl-8');

    const item = screen.getByText('Item');
    expect(item).toHaveClass('pl-8');

    const subTrigger = screen.getByText('SubTrigger');
    expect(subTrigger).toHaveClass('pl-8');
  });
});
