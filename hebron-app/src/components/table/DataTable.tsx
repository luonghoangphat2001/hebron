// components/ui/data-table/DataTable.tsx
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';

import { TablePageSizeSelector } from '@/components/table/CustomTablePagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CaretDoubleLeftIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { CaretDoubleRightIcon } from '@phosphor-icons/react/dist/ssr';

export type DataTableProps<TData, TValue> = {
  /** Row data for the current page */
  data: TData[];
  /** tanstack/react-table column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Total number of rows across ALL pages (used to compute page count) */
  totalRows: number;
  /** Controlled pagination state */
  pagination: PaginationState;
  /** Called when page index OR page size changes */
  onPaginationChange: OnChangeFn<PaginationState>;
  /** Controlled row-selection state (key = row id) */
  rowSelection?: RowSelectionState;
  /** Called when row selection changes */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** Row id accessor – defaults to row index */
  getRowId?: (row: TData) => string;
  /** Page size options shown in the selector */
  pageSizeOptions?: number[];
  /** Show the checkbox selection column */
  enableRowSelection?: boolean;
  /** Extra class for the wrapper */
  className?: string;
  /** Shown when data is empty */
  emptyMessage?: string;
  /** Show loading skeleton */
  isLoading?: boolean;

  tableClassName?: string;
  isBorder?: boolean;
};

export type MyColumnMeta = {
  width?: string;
  align?: 'left' | 'center' | 'right';
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Pagination bar ───────────────────────────────────────────────────────────

function TablePagination({
  pageIndex,
  pageCount,
  onPageChange,
}: {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    const pages: (number | 'ellipsis')[] = [0];

    if (pageIndex > 3) pages.push('ellipsis');

    const start = Math.max(1, pageIndex - 1);
    const end = Math.min(pageCount - 2, pageIndex + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (pageIndex < pageCount - 4) pages.push('ellipsis');

    pages.push(pageCount - 1);

    return pages;
  };

  const iconButtonClass =
    'flex size-8 items-center justify-center shi rounded-full shrink-0 text-neutral-500 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-30 cursor-pointer';

  const pageButtonClass =
    'flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 cursor-pointer';

  const activePageButtonClass = 'border-neutral-200 bg-neutral-100 text-neutral-500';

  return (
    <div className='flex items-center gap-2 select-none'>
      <button type='button' className={iconButtonClass} disabled={pageIndex === 0} onClick={() => onPageChange(0)}>
        <CaretDoubleLeftIcon size={16} className='text-neutral-500' weight='bold' />
      </button>

      <button type='button' className={iconButtonClass} disabled={pageIndex === 0} onClick={() => onPageChange(pageIndex - 1)}>
        <CaretLeftIcon size={16} className='text-neutral-500' weight='bold' />
      </button>

      <div className='flex items-center gap-2'>
        {getPageNumbers().map((page, idx) =>
          page === 'ellipsis' ? (
            <button key={`ellipsis-${idx}`} type='button' disabled className={pageButtonClass}>
              ...
            </button>
          ) : (
            <button
              key={page}
              type='button'
              className={cn(pageButtonClass, page === pageIndex && activePageButtonClass)}
              onClick={() => onPageChange(page)}>
              {page + 1}
            </button>
          ),
        )}
      </div>

      <button
        type='button'
        className={iconButtonClass}
        disabled={pageIndex >= pageCount - 1}
        onClick={() => onPageChange(pageIndex + 1)}>
        <CaretRightIcon size={16} className='text-neutral-500' weight='bold' />
      </button>

      <button
        type='button'
        className={iconButtonClass}
        disabled={pageIndex >= pageCount - 1}
        onClick={() => onPageChange(pageCount - 1)}>
        <CaretDoubleRightIcon size={16} className='text-neutral-500' weight='bold' />
      </button>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}>
              <div className='bg-muted h-4 w-full animate-pulse rounded' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Main DataTable component ─────────────────────────────────────────────────

export function DataTable<TData, TValue>({
  data,
  columns,
  totalRows,
  pagination,
  onPaginationChange,
  rowSelection = {},
  onRowSelectionChange,
  getRowId,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  enableRowSelection = false,
  className,
  emptyMessage = 'No results.',
  isLoading = false,
  tableClassName,
  isBorder = true,
}: DataTableProps<TData, TValue>) {
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

  // Inject a checkbox column at position 0 when selection is enabled
  const allColumns: ColumnDef<TData, TValue>[] = enableRowSelection
    ? [
        {
          id: '__select__',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label='Select all'
            />
          ),
          cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label='Select row' />
          ),
          // size: 40,
          enableSorting: false,
          enableHiding: false,
          meta: { align: 'center', width: '60px' },
        } as ColumnDef<TData, TValue>,
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      rowSelection,
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      onPaginationChange(next);
    },
    onRowSelectionChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableRowSelection,
  });

  return (
    <div className={cn('w-full', className)}>
      {/* ── Table ── */}
      <div className={cn('overflow-x-auto', isBorder && 'rounded-t-[8px] border border-neutral-200')}>
        <Table className={cn('w-full table-fixed', tableClassName)}>
          <TableHeader className='bg-neutral-100'>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className='border-b! border-neutral-200 hover:bg-neutral-100'>
                {hg.headers.map((header) => {
                  const columnMeta = header.column.columnDef.meta as MyColumnMeta | undefined;

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'truncate px-3 text-sm font-medium text-neutral-900',
                        columnMeta?.align === 'center' && 'text-center',
                        columnMeta?.align === 'right' && 'text-right',
                      )}
                      style={{ width: columnMeta?.width }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={pageSize} cols={allColumns.length} />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('border-neutral-200', !isBorder && 'last:border-b!')}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'truncate p-3',
                        (cell.column.columnDef.meta as MyColumnMeta | undefined)?.align === 'center' && 'text-center',
                        (cell.column.columnDef.meta as MyColumnMeta | undefined)?.align === 'right' && 'text-right',
                      )}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={allColumns.length} className='text-muted-foreground h-24 text-center'>
                  {emptyMessage || 'No results'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer: row count + page size + pagination ── */}
      <div
        className={cn(
          'flex w-full items-center justify-between gap-2 p-6',
          isBorder && 'rounded-b-[8px] border border-t-0 border-neutral-200',
        )}>
        {/* Left: info + selection count */}
        {/* <p className='text-muted-foreground text-sm'>
          {enableRowSelection && Object.keys(rowSelection).length > 0 && (
            <span className='text-foreground mr-2 font-medium'>{Object.keys(rowSelection).length} selected ·</span>
          )}
          {totalRows > 0 ? `Showing ${start}–${end} of ${totalRows} rows` : 'No rows'}
        </p> */}
        <p className='text-sm text-neutral-400'>{`${pageIndex + 1}페이지/${totalRows}개`}</p>

        <TablePagination
          pageIndex={pageIndex}
          pageCount={pageCount}
          onPageChange={(page) => onPaginationChange({ pageIndex: page, pageSize })}
        />

        <TablePageSizeSelector
          value={pageSize}
          options={pageSizeOptions}
          onChange={(size) => onPaginationChange({ pageIndex: 0, pageSize: size })}
        />
      </div>
    </div>
  );
}
