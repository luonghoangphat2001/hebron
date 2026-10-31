import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { useOrderStatusHistoryQuery } from '@/data/order/order.query';
import type { OrderStatusHistoryItemRESP } from '@/data/order/order.response';
import { getOrderStatusBadgeInfo } from '@/data/order/order.service';
import { cn } from '@/lib/utils';
import { DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import { formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  orderId?: string;
};

const OrderStatusHistorySection = ({ orderId }: Props) => {
  const { t: tOrder } = useTranslation('order');
  const { t: tEnum } = useTranslation('enum');

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useOrderStatusHistoryQuery(orderId);

  const historyList = useMemo(() => data?.history || [], [data?.history]);
  const totalRows = data?.pagination?.total_item || historyList.length;

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return historyList.slice(start, start + pagination.pageSize);
  }, [historyList, pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo<ColumnDef<OrderStatusHistoryItemRESP>[]>(
    () => [
      {
        id: 'changed_at',
        header: tOrder('column.modified_at'),
        cell: ({ row }) => (
          <span className='text-muted-foreground font-mono text-xs'>{formatDate(row.original.changed_at, DATE_TIME_FORMAT)}</span>
        ),
        meta: { width: '170px' },
      },
      {
        id: 'status_change',
        header: tOrder('column.status_change'),
        cell: ({ row }) => <OrderStatusChangeCell item={row.original} tEnum={tEnum} />,
        meta: { width: '240px' },
      },
      {
        id: 'changed_by',
        header: tOrder('column.modified_by'),
        cell: ({ row }) => {
          const user = row.original.changed_by;
          if (!user) return <span className='text-muted-foreground text-xs'>-</span>;
          return (
            <div className='flex flex-col text-xs'>
              <span className='font-medium text-gray-800 dark:text-gray-200'>{user.name || user.username}</span>
              {user.email && <span className='text-muted-foreground text-[10px]'>({user.email})</span>}
            </div>
          );
        },
        meta: { width: '200px' },
      },
      {
        id: 'reason_notes',
        header: tOrder('column.reason_notes'),
        cell: ({ row }) => {
          const text = row.original.reason || row.original.notes;
          return <span className='text-muted-foreground text-xs'>{text || '-'}</span>;
        },
      },
    ],
    [tEnum, tOrder],
  );

  return (
    <section className='space-y-4 rounded-md border border-gray-200 p-5 dark:border-gray-800'>
      <h2 className='flex items-center gap-2 text-sm font-semibold'>
        <Clock className='size-4' />
        {tOrder('section.status_history')}
      </h2>

      <DataTable
        data={paginatedData}
        columns={columns}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        emptyMessage={tOrder('empty.no_status_history')}
      />
    </section>
  );
};

function OrderStatusChangeCell({ item, tEnum }: { item: OrderStatusHistoryItemRESP; tEnum: any }) {
  const oldInfo = getOrderStatusBadgeInfo(item.old_status, tEnum);
  const newInfo = getOrderStatusBadgeInfo(item.new_status, tEnum);

  return (
    <div className='flex items-center gap-1.5 text-xs'>
      {oldInfo && (
        <>
          <Badge variant='outline' className={cn('border-none font-normal', oldInfo.badgeClass)}>
            {oldInfo.label}
          </Badge>
          <span className='text-muted-foreground'>→</span>
        </>
      )}
      {newInfo && (
        <Badge variant='outline' className={cn('border-none font-normal', newInfo.badgeClass)}>
          {newInfo.label}
        </Badge>
      )}
    </div>
  );
}

export default OrderStatusHistorySection;
