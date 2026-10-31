import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type FAQCategoryTabsSkeletonProps = {
  count?: number;
  className?: string;
};

const FAQCategoryTabsSkeleton = ({ count = 6, className }: FAQCategoryTabsSkeletonProps) => {
  return (
    <div className={cn('border-b border-neutral-200', className)} aria-busy='true' aria-label='Loading FAQ categories'>
      <div className='scrollbar-hide -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0'>
        <div className='flex w-max gap-4 py-3 lg:w-full lg:gap-2'>
          {Array.from({ length: count }, (_, i) => (
            <Skeleton key={i} className='h-8 w-24 shrink-0 rounded lg:flex-1' />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQCategoryTabsSkeleton;
