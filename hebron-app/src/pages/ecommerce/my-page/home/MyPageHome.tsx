import { Skeleton } from '@/components/ui/skeleton';
import { mapDashboardStatusToOverviewGroup } from '@/data/dashboard/dashboard.mapper';
import { useDashboardQuery } from '@/data/dashboard/dashboard.query';
import { mapMyPageOrderHistoryToRecentOrders } from '@/data/orders/orders.mapper';
import RecentOrdersSection from '@/pages/ecommerce/my-page/components/RecentOrdersSection';
import StatusOverviewSection from '@/pages/ecommerce/my-page/components/StatusOverviewSection';

const StatusOverviewSkeleton = () => (
  <section className='flex w-full min-w-0 flex-col gap-2 md:gap-4' aria-hidden>
    <Skeleton className='h-7 w-28' />
    <div className='scrollbar-hide overflow-x-auto rounded-2xl bg-neutral-100'>
      <div className='grid min-w-[35rem] grid-cols-5 gap-2 px-4 pt-9 pb-3 md:min-w-0'>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className='flex flex-col items-center gap-3'>
            <Skeleton className='size-20 rounded-full bg-white' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-5 w-6' />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const RecentOrdersSkeleton = () => (
  <section className='flex flex-col gap-4 bg-white' aria-hidden>
    <div className='flex items-center justify-between'>
      <Skeleton className='h-7 w-32' />
      <Skeleton className='h-9 w-20' />
    </div>
    <div className='hidden overflow-hidden rounded-lg border border-neutral-200 md:block'>
      <Skeleton className='h-12 w-full rounded-none' />
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className='flex items-center gap-6 border-t border-neutral-100 p-4'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-14 flex-1' />
          <Skeleton className='h-6 w-14' />
          <Skeleton className='h-6 w-20' />
          <Skeleton className='h-7 w-18' />
        </div>
      ))}
    </div>
    <div className='flex flex-col gap-3 md:hidden'>
      {Array.from({ length: 2 }, (_, index) => (
        <Skeleton key={index} className='h-36 w-full' />
      ))}
    </div>
  </section>
);

const MyPageHome = () => {
  const { data, isLoading } = useDashboardQuery();
  const dashboard = data?.data;

  const statusGroup = mapDashboardStatusToOverviewGroup(dashboard);
  const recentOrders = mapMyPageOrderHistoryToRecentOrders(dashboard?.recent_orders ?? []);

  return (
    <div className='flex w-full min-w-0 flex-col gap-10 bg-white pb-10'>
      {isLoading ? <StatusOverviewSkeleton /> : <StatusOverviewSection group={statusGroup} />}
      {isLoading ? <RecentOrdersSkeleton /> : <RecentOrdersSection orders={recentOrders} />}
    </div>
  );
};

export default MyPageHome;
