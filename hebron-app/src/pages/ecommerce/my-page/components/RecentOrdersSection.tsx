import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MyPagePageTitle from '@/pages/ecommerce/my-page/components/MyPagePageTitle';
import OrdersTable from '@/pages/ecommerce/my-page/components/OrdersTable';
import { MY_ROUTE } from '@/utils/constants/route.constant';
import type { RecentOrder } from '@/utils/types/my-page.type';
import { CaretRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

type RecentOrdersSectionProps = {
  orders: RecentOrder[];
  className?: string;
};

const RECENT_ORDERS_LABELS = {
  title: '최근 주문 내역',
  viewAll: '더보기',
  empty: '최근 주문내역이 없습니다.',
} as const;

const RecentOrdersSection = ({ orders, className }: RecentOrdersSectionProps) => {
  return (
    <section className={cn('flex flex-col gap-4 bg-white', className)}>
      <div className='flex items-center justify-between'>
        <MyPagePageTitle>{RECENT_ORDERS_LABELS.title}</MyPagePageTitle>
        <Button
          asChild
          variant='outline'
          className='flex items-center gap-1 text-sm font-normal text-neutral-500 transition-colors hover:text-neutral-950'>
          <Link to={`${MY_ROUTE.MY_PAGE.HOME}/${MY_ROUTE.MY_PAGE.ORDERS}`}>
            {RECENT_ORDERS_LABELS.viewAll}
            <CaretRightIcon className='size-3.5' />
          </Link>
        </Button>
      </div>

      <OrdersTable orders={orders} emptyMessage={RECENT_ORDERS_LABELS.empty} statusHighlightMode='payment-and-correction' />
    </section>
  );
};

export default RecentOrdersSection;
