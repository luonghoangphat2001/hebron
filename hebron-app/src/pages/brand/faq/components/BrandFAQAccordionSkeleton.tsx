import { cn } from '@/lib/utils';

type BrandFAQAccordionSkeletonProps = {
  count?: number;
  className?: string;
};

const SKELETON_WIDTHS = ['w-3/5', 'w-4/5', 'w-1/2', 'w-2/3', 'w-3/4'];

const BrandFAQAccordionSkeleton = ({ count = 5, className }: BrandFAQAccordionSkeletonProps) => {
  return (
    <div className={cn('flex flex-col', className)} aria-busy='true' aria-label='Loading Brand FAQs'>
      {Array.from({ length: count }, (_, index) => {
        const widthClass = SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];
        return (
          <div key={index} className='flex items-center justify-between border-b border-neutral-800 py-4 last:border-b-0'>
            <div className={cn('h-4 animate-pulse rounded bg-neutral-800', widthClass)} />
            <div className='size-3.5 shrink-0 animate-pulse rounded bg-neutral-800' />
          </div>
        );
      })}
    </div>
  );
};

export default BrandFAQAccordionSkeleton;
