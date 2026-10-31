import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export const HomepageContentSkeleton = () => (
  <div className='grid items-start gap-6 lg:grid-cols-12'>
    <Card className='rounded-2xl shadow-xs lg:col-span-4'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between gap-3'>
          <div className='space-y-1.5'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-3.5 w-48' />
          </div>
          <Skeleton className='h-6 w-16 rounded-full' />
        </div>
      </CardHeader>
      <CardContent className='space-y-2.5 pt-1'>
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className='flex items-center justify-between rounded-xl border p-3.5'>
            <div className='flex items-center gap-3.5'>
              <Skeleton className='h-7 w-7 rounded-full' />
              <div className='space-y-1.5'>
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
            <Skeleton className='h-4 w-12 rounded-md' />
          </div>
        ))}
      </CardContent>
    </Card>

    <Card className='rounded-2xl shadow-xs lg:col-span-8'>
      <CardHeader className='pb-4'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-5 w-24 rounded-md' />
            </div>
            <Skeleton className='h-3.5 w-64' />
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className='space-y-5 pt-5'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-8 w-28 rounded-md' />
        </div>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className='space-y-2 rounded-xl border p-3'>
              <Skeleton className='aspect-square w-full rounded-lg' />
              <Skeleton className='h-3.5 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default HomepageContentSkeleton;
