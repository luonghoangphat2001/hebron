import { Skeleton } from '@/components/ui/skeleton';
import ProductCardSkeleton from '../../product/components/ProductCardSkeleton';

const PRODUCT_SKELETONS = Array.from({ length: 5 }, (_, index) => index);
const CATEGORY_SKELETONS = Array.from({ length: 6 }, (_, index) => index);

const ProductSectionSkeleton = () => (
  <section className='space-y-4 md:space-y-6'>
    <div className='flex items-center justify-between'>
      <Skeleton className='h-8 w-48' />
      <Skeleton className='hidden h-10 w-28 md:block' />
    </div>
    <div className='flex gap-2 overflow-hidden py-1'>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className='h-9 w-24 shrink-0 rounded-full' />
      ))}
    </div>
    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5'>
      {PRODUCT_SKELETONS.map((index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  </section>
);

const HomePageLoadingSkeleton = () => (
  <div className='w-full' aria-label='Loading home page' role='status'>
    <Skeleton className='aspect-5/2 w-full rounded-none md:aspect-1240/344' />
    <div className='ecommerce-container'>
      <div className='flex w-full items-center justify-start gap-3 overflow-hidden py-6 sm:justify-center'>
        {CATEGORY_SKELETONS.map((index) => (
          <div key={index} className='flex w-16 shrink-0 flex-col items-center gap-2'>
            <Skeleton className='size-16 rounded-full' />
            <Skeleton className='h-3 w-12' />
          </div>
        ))}
      </div>
    </div>
    <div className='ecommerce-container space-y-8 pt-6 pb-12 md:space-y-22 md:pt-15 md:pb-30'>
      <ProductSectionSkeleton />
      <div className='grid grid-cols-2 gap-4'>
        <Skeleton className='aspect-[632/176] w-full rounded-xl' />
        <Skeleton className='aspect-[632/176] w-full rounded-xl' />
      </div>
      <ProductSectionSkeleton />
      <ProductSectionSkeleton />
      <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
        {Array.from({ length: 2 }, (_, index) => (
          <section key={index} className='space-y-5'>
            <Skeleton className='h-8 w-36' />
            <Skeleton className='h-48 w-full rounded-lg' />
          </section>
        ))}
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className='h-56 w-full rounded-2xl' />
        ))}
      </div>
    </div>
  </div>
);

export default HomePageLoadingSkeleton;
