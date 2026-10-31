import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const SKELETON_WIDTHS = ['w-3/5', 'w-4/5', 'w-1/2', 'w-2/3', 'w-3/4'];

type FAQAccordionItemSkeletonProps = {
  index?: number;
  className?: string;
};

export const FAQAccordionItemSkeleton = ({ index = 0, className }: FAQAccordionItemSkeletonProps) => {
  const widthClass = SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];

  return (
    <div
      className={cn('flex w-full items-center justify-between border-b border-neutral-200 px-4 py-6 last:border-b-0', className)}>
      <div className='flex min-w-0 flex-1 items-center gap-1.5 md:gap-6'>
        {/* Question mark icon placeholder */}
        <Skeleton className='size-6 shrink-0 rounded-full md:size-12 md:rounded-xl' />

        {/* Category & Question text placeholders */}
        <div className='flex min-w-0 flex-1 items-center gap-1.5 md:gap-3'>
          <Skeleton className='h-5 w-16 shrink-0 rounded md:h-6 md:w-20' />
          <Skeleton className={cn('h-5 rounded md:h-6', widthClass)} />
        </div>
      </div>

      {/* Desktop caret placeholder */}
      <Skeleton className='hidden size-5 shrink-0 rounded md:block' />
    </div>
  );
};

type FAQAccordionSkeletonProps = {
  count?: number;
  className?: string;
};

const FAQAccordionSkeleton = ({ count = 5, className }: FAQAccordionSkeletonProps) => {
  return (
    <div className={cn('flex flex-col', className)} aria-busy='true' aria-label='Loading FAQs'>
      <div className='flex flex-col'>
        {Array.from({ length: count }, (_, index) => (
          <FAQAccordionItemSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
};

export default FAQAccordionSkeleton;
