'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DataTableDensity = 'default' | 'compact';

export interface DataTableColumn<Row> {
  id: string;
  header: string;
  cell: (row: Row) => ReactNode;
  align?: 'start' | 'end';
  /** Hide below the sm breakpoint. */
  hideOnMobile?: boolean;
  /** Numeric column: right-align and use tabular-nums. */
  numeric?: boolean;
}

export interface DataTableProps<Row> {
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  density?: DataTableDensity;
  stickyHeader?: boolean;
  onRowClick?: (row: Row) => void;
  emptyState?: ReactNode;
  className?: string;
}

const ROW_HEIGHT: Record<DataTableDensity, string> = {
  default: 'h-(--table-row-h-default)',
  compact: 'h-(--table-row-h-compact)',
};

const CELL_PADDING: Record<DataTableDensity, string> = {
  default: 'px-4 py-3',
  compact: 'px-3 py-1.5',
};

const CLICKABLE_ROW =
  'cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2';

function columnClasses<Row>(column: DataTableColumn<Row>): string {
  const align = column.align ?? (column.numeric ? 'end' : 'start');
  return cn(
    align === 'end' ? 'text-right' : 'text-left',
    column.numeric && 'tabular-nums',
    column.hideOnMobile && 'hidden sm:table-cell',
  );
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  density = 'default',
  stickyHeader = false,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<Row>) {
  const isClickable = Boolean(onRowClick);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    row: Row,
  ) => {
    if (!onRowClick || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onRowClick(row);
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      {/* border-separate keeps a sticky header painting its own border; row rules live on the cells. */}
      <table className="border-separate border-spacing-0 text-sm w-full">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className={cn(stickyHeader && 'sticky top-0 z-10')}>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  'border-b border-rule-mist bg-surface-inset text-2xs font-semibold uppercase tracking-wide text-ink-subtle',
                  CELL_PADDING[density],
                  columnClasses(column),
                  stickyHeader && 'sticky top-0 z-10',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? emptyState && (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    {emptyState}
                  </td>
                </tr>
              )
            : rows.map((row, rowIndex) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    ROW_HEIGHT[density],
                    'transition-colors hover:bg-surface-sunken',
                    isClickable && CLICKABLE_ROW,
                  )}
                  tabIndex={isClickable ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    isClickable
                      ? (event) => handleKeyDown(event, row)
                      : undefined
                  }
                >
                  {columns.map((column, columnIndex) => (
                    <td
                      key={column.id}
                      className={cn(
                        'text-ink-default',
                        CELL_PADDING[density],
                        columnClasses(column),
                        rowIndex > 0 && 'border-t border-rule-mist',
                        columnIndex === 0 && 'font-semibold text-ink-strong',
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
