import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CaretDoubleLeftIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { CaretDoubleRightIcon } from '@phosphor-icons/react/dist/ssr';

type TablePageSizeSelectorProps = {
  value: number;
  options: readonly number[];
  onChange: (size: number) => void;
};

export const TablePageSizeSelector = ({ value, options, onChange }: TablePageSizeSelectorProps) => (
  <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
    <SelectTrigger className='h-8 min-w-24 border-neutral-200 bg-white font-semibold text-neutral-500 shadow-none'>
      <SelectValue />
    </SelectTrigger>
    <SelectContent position='popper' side='bottom' align='end' sideOffset={6} className='min-w-(--radix-select-trigger-width)'>
      {options.map((size) => (
        <SelectItem key={size} value={String(size)}>
          {size} / page
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

type PaginationControlsProps = {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const PaginationControls = ({ pageIndex, pageCount, onPageChange, className }: PaginationControlsProps) => {
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
    'flex size-8 items-center justify-center rounded-full shrink-0 text-neutral-500 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-30 cursor-pointer';

  const pageButtonClass =
    'flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 cursor-pointer';

  const activePageButtonClass = 'border-neutral-200 bg-neutral-100 text-neutral-500';

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 select-none', className)}>
      <button type='button' className={iconButtonClass} disabled={pageIndex === 0} onClick={() => onPageChange(0)}>
        <CaretDoubleLeftIcon className='size-4 text-neutral-500' weight='bold' />
      </button>

      <button type='button' className={iconButtonClass} disabled={pageIndex === 0} onClick={() => onPageChange(pageIndex - 1)}>
        <CaretLeftIcon className='size-4 text-neutral-500' weight='bold' />
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
        <CaretRightIcon className='size-4 text-neutral-500' weight='bold' />
      </button>

      <button
        type='button'
        className={iconButtonClass}
        disabled={pageIndex >= pageCount - 1}
        onClick={() => onPageChange(pageCount - 1)}>
        <CaretDoubleRightIcon className='size-4 text-neutral-500' weight='bold' />
      </button>
    </div>
  );
};

type CustomTablePaginationProps = {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalRows?: number;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  /** Mobile: chỉ nút trang. Desktop footer: bỏ prop này (mặc định full footer). */
  compact?: boolean;
};

const CustomTablePagination = ({
  pageIndex,
  pageCount,
  onPageChange,
  className,
  totalRows,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  compact = false,
}: CustomTablePaginationProps) => {
  const hasListFooter =
    totalRows !== undefined && pageSize !== undefined && pageSizeOptions !== undefined && onPageSizeChange !== undefined;

  if (!hasListFooter || compact) {
    return <PaginationControls pageIndex={pageIndex} pageCount={pageCount} onPageChange={onPageChange} className={className} />;
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className='text-sm text-neutral-400'>{`${pageIndex + 1}페이지/${totalRows}개`}</p>
      {pageCount > 1 ? (
        <PaginationControls pageIndex={pageIndex} pageCount={pageCount} onPageChange={onPageChange} />
      ) : (
        <div aria-hidden />
      )}
      <TablePageSizeSelector value={pageSize} options={pageSizeOptions} onChange={onPageSizeChange} />
    </div>
  );
};

export default CustomTablePagination;
