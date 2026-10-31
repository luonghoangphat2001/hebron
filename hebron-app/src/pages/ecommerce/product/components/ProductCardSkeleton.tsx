import { Skeleton } from '@/components/ui/skeleton';

const ProductCardSkeleton = () => (
  <article className='min-w-0' aria-hidden='true'>
    <Skeleton className='aspect-square w-full rounded-md' />
    <div className='mt-2 space-y-2'>
      <Skeleton className='h-5 w-4/5' />
      <Skeleton className='h-4 w-2/5' />
      <Skeleton className='h-5 w-1/2' />
    </div>
  </article>
);

export default ProductCardSkeleton;
