import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from './data-table';

interface TestRow {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
}

const rows: TestRow[] = [
  { id: '1', name: 'Somchai', balance: 1200 },
  { id: '2', name: 'Anna', balance: 0 },
];

const columns: DataTableColumn<TestRow>[] = [
  { id: 'name', header: 'Guest', cell: (row) => row.name },
  {
    id: 'balance',
    header: 'Balance',
    cell: (row) => row.balance,
    numeric: true,
  },
];

function renderTable(props?: Partial<DataTableProps<TestRow>>) {
  return render(
    <DataTable<TestRow>
      caption="Guest list"
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      {...props}
    />,
  );
}

describe('DataTable', () => {
  it('renders a table with an sr-only caption', () => {
    renderTable();

    const table = screen.getByRole('table', { name: 'Guest list' });
    expect(table).toBeInTheDocument();
    expect(table.querySelector('caption')).toHaveClass('sr-only');
  });

  it('renders column headers with scope="col"', () => {
    renderTable();

    const header = screen.getByRole('columnheader', { name: 'Guest' });
    expect(header).toHaveAttribute('scope', 'col');
    expect(
      screen.getByRole('columnheader', { name: 'Balance' }),
    ).toHaveAttribute('scope', 'col');
  });

  it('renders one row per item', () => {
    renderTable();

    expect(screen.getByText('Somchai')).toBeInTheDocument();
    expect(screen.getByText('Anna')).toBeInTheDocument();
  });

  it('emphasises the anchor column', () => {
    renderTable();

    expect(screen.getByText('Somchai')).toHaveClass(
      'font-semibold',
      'text-ink-strong',
    );
    expect(screen.getByText('1200')).not.toHaveClass('text-ink-strong');
  });

  it('right-aligns numeric columns with tabular numerals', () => {
    renderTable();

    expect(screen.getByText('1200')).toHaveClass('text-right', 'tabular-nums');
  });

  it('uses the default row height token', () => {
    renderTable();

    expect(screen.getAllByRole('row')[1]).toHaveClass(
      'h-(--table-row-h-default)',
    );
  });

  it('uses the compact row height token when density is compact', () => {
    renderTable({ density: 'compact' });

    expect(screen.getAllByRole('row')[1]).toHaveClass(
      'h-(--table-row-h-compact)',
    );
  });

  it('sticks the header row when stickyHeader is set', () => {
    renderTable({ stickyHeader: true });

    expect(screen.getAllByRole('row')[0]).toHaveClass('sticky', 'top-0');
  });

  it('renders the empty state instead of rows when there are none', () => {
    renderTable({ rows: [], emptyState: <p>No guests found</p> });

    expect(screen.getByText('No guests found')).toBeInTheDocument();
    expect(screen.queryByText('Somchai')).not.toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ onRowClick });

    await user.click(screen.getByText('Somchai'));

    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('calls onRowClick when Enter is pressed on a focused row', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ onRowClick });

    const firstRow = screen.getAllByRole('row')[1];
    firstRow.focus();
    await user.keyboard('{Enter}');

    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('calls onRowClick when Space is pressed on a focused row', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    renderTable({ onRowClick });

    const firstRow = screen.getAllByRole('row')[1];
    firstRow.focus();
    await user.keyboard(' ');

    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('makes clickable rows keyboard focusable and inert otherwise', () => {
    const { unmount } = renderTable({ onRowClick: vi.fn() });
    expect(screen.getAllByRole('row')[1]).toHaveAttribute('tabindex', '0');
    unmount();

    renderTable();
    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('tabindex');
  });

  it('hides mobile-hidden columns below the sm breakpoint', () => {
    renderTable({
      columns: [
        columns[0],
        { ...columns[1], hideOnMobile: true },
      ] as DataTableColumn<TestRow>[],
    });

    expect(screen.getByRole('columnheader', { name: 'Balance' })).toHaveClass(
      'hidden',
      'sm:table-cell',
    );
  });
});
