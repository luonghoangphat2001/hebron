import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CaretDoubleLeftIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { CaretDoubleRightIcon } from '@phosphor-icons/react/dist/ssr';

export type BrandPaginationProps = {
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  showPageCount?: boolean;
  className?: string;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 12, 24, 36] as const;

const getPageNumbers = (pageIndex: number, pageCount: number): (number | 'ellipsis')[] => {
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

const BrandPagination = ({
  pageIndex,
  pageCount,
  onPageChange,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  showPageCount = true,
  className,
}: BrandPaginationProps) => {
  if (pageCount <= 1 && !pageSize) {
    return null;
  }

  const safePageIndex = Math.max(0, Math.min(pageIndex, Math.max(0, pageCount - 1)));
  const pageNumbers = getPageNumbers(safePageIndex, pageCount);

  const iconButtonClass =
    'flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer';

  const pagePillClass =
    'flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-sm font-semibold text-[#5c5c5c] transition hover:border-neutral-700 hover:text-neutral-200 cursor-pointer';

  const activePagePillClass = 'border-neutral-700 bg-neutral-800 text-white hover:text-white';

  const hasPageSizeSelector = Boolean(pageSize && onPageSizeChange);

  return (
    <nav
      aria-label='페이지 이동'
      className={cn(
        'flex w-full flex-col items-center justify-between gap-4 p-4 select-none sm:flex-row sm:gap-6 md:p-6',
        className,
      )}>
      <div className='flex w-full items-center justify-center sm:w-[200px] sm:justify-start'>
        {showPageCount && pageCount > 0 && (
          <p className='text-sm font-normal whitespace-nowrap text-neutral-500'>
            {safePageIndex + 1} / {pageCount} 페이지
          </p>
        )}
      </div>

      <div className='flex flex-1 items-center justify-center gap-2'>
        <button
          type='button'
          aria-label='첫 페이지로'
          className={iconButtonClass}
          disabled={safePageIndex === 0}
          onClick={() => onPageChange(0)}>
          <CaretDoubleLeftIcon className='size-4' weight='bold' />
        </button>

        <button
          type='button'
          aria-label='이전 페이지'
          className={iconButtonClass}
          disabled={safePageIndex === 0}
          onClick={() => onPageChange(safePageIndex - 1)}>
          <CaretLeftIcon className='size-4' weight='bold' />
        </button>

        <div className='flex items-center gap-2'>
          {pageNumbers.map((page, idx) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className='flex size-8 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-sm font-semibold text-[#5c5c5c]'>
                ...
              </span>
            ) : (
              <button
                key={page}
                type='button'
                className={cn(pagePillClass, page === safePageIndex && activePagePillClass)}
                onClick={() => onPageChange(page)}
                aria-current={page === safePageIndex ? 'page' : undefined}>
                {page + 1}
              </button>
            ),
          )}
        </div>

        <button
          type='button'
          aria-label='다음 페이지'
          className={iconButtonClass}
          disabled={safePageIndex >= pageCount - 1}
          onClick={() => onPageChange(safePageIndex + 1)}>
          <CaretRightIcon className='size-4' weight='bold' />
        </button>

        <button
          type='button'
          aria-label='마지막 페이지로'
          className={iconButtonClass}
          disabled={safePageIndex >= pageCount - 1}
          onClick={() => onPageChange(pageCount - 1)}>
          <CaretDoubleRightIcon className='size-4' weight='bold' />
        </button>
      </div>

      <div className='flex w-full items-center justify-center sm:w-[200px] sm:justify-end'>
        {hasPageSizeSelector && (
          <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange?.(Number(val))}>
            <SelectTrigger className='h-8 min-w-24 rounded-lg border-neutral-800 bg-neutral-950 px-2.5 text-xs font-semibold text-neutral-200 shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] hover:border-neutral-700 sm:text-sm'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position='popper'
              side='bottom'
              align='end'
              sideOffset={6}
              className='min-w-(--radix-select-trigger-width) border-neutral-800 bg-neutral-900 text-neutral-200'>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)} className='cursor-pointer text-white'>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </nav>
  );
};

export default BrandPagination;
