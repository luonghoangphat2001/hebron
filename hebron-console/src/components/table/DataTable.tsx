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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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
};

export type MyColumnMeta = {
  width?: string;
  align?: 'left' | 'center' | 'right';
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function PageSizeSelector({ value, options, onChange }: { value: number; options: number[]; onChange: (size: number) => void }) {
  const { t: tCommon } = useTranslation('common');

  return (
    <div className='text-muted-foreground flex w-full items-center gap-2 text-sm'>
      <span>{tCommon('pagination.rows_per_page', 'Rows per page')}</span>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className='h-8'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TablePagination({
  pageIndex,
  pageCount,
  onPageChange,
}: {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const { t: tCommon } = useTranslation('common');

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

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            text={tCommon('pagination.previous', 'Previous')}
            onClick={(e) => {
              e.preventDefault();
              if (pageIndex > 0) onPageChange(pageIndex - 1);
            }}
            className={cn(pageIndex === 0 && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>

        {getPageNumbers().map((page, idx) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href='#'
                isActive={page === pageIndex}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}>
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href='#'
            text={tCommon('pagination.next', 'Next')}
            onClick={(e) => {
              e.preventDefault();
              if (pageIndex < pageCount - 1) onPageChange(pageIndex + 1);
            }}
            className={cn(pageIndex >= pageCount - 1 && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

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
  emptyMessage,
  isLoading = false,
  tableClassName,
}: DataTableProps<TData, TValue>) {
  const { t: tCommon } = useTranslation('common');
  const { pageIndex, pageSize } = pagination;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

  const allColumns: ColumnDef<TData, TValue>[] = enableRowSelection
    ? [
        {
          id: '__select__',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label={tCommon('table.select_all', 'Select all')}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label={tCommon('table.select_row', 'Select row')}
            />
          ),
          enableSorting: false,
          enableHiding: false,
          meta: { align: 'center', width: '60px' },
        } as ColumnDef<TData, TValue>,
        ...columns,
      ]
    : columns;

  // eslint-disable-next-line react-hooks/incompatible-library
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

  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);
  const selectedCount = Object.keys(rowSelection).filter((key) => rowSelection[key]).length;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='overflow-x-auto rounded-md border'>
        <Table className={cn('min-w-full', tableClassName)}>
          <TableHeader className='bg-slate-100'>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className='hover:bg-slate-100'>
                {hg.headers.map((header) => {
                  const columnMeta = header.column.columnDef.meta as MyColumnMeta | undefined;

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'truncate px-3 text-gray-500',
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => {
                    const columnMeta = cell.column.columnDef.meta as MyColumnMeta | undefined;

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'truncate p-3',
                          columnMeta?.align === 'center' && 'text-center',
                          columnMeta?.align === 'right' && 'text-right',
                        )}
                        style={{ width: columnMeta?.width }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={allColumns.length} className='text-muted-foreground h-24 text-center'>
                  {emptyMessage || tCommon('empty.no_results', 'No results.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-col items-center gap-2 sm:flex-row sm:justify-between'>
        <p className='text-muted-foreground text-sm'>
          {enableRowSelection && selectedCount > 0 && (
            <span className='text-foreground mr-2 font-medium'>
              {tCommon('pagination.selected_count', '{{count}} selected', { count: selectedCount })} ·
            </span>
          )}
          {totalRows > 0
            ? tCommon('pagination.showing_rows', 'Showing {{start}}–{{end}} of {{total}} rows', {
                start,
                end,
                total: totalRows,
              })
            : tCommon('pagination.no_rows', 'No rows')}
        </p>

        <div className='flex items-center gap-2'>
          <PageSizeSelector
            value={pageSize}
            options={pageSizeOptions}
            onChange={(size) => onPaginationChange({ pageIndex: 0, pageSize: size })}
          />
          <TablePagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            onPageChange={(page) => onPaginationChange({ pageIndex: page, pageSize })}
          />
        </div>
      </div>
    </div>
  );
}
