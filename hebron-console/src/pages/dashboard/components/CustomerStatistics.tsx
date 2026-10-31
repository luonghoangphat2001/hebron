import { DataTable } from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardCustomerStaticQuery } from '@/data/dashboard/dashboard.query';
import type { CustomerStaticDetailRESP } from '@/data/dashboard/dashboard.response';
import { formatMetricValue } from '@/data/dashboard/dashboard.service';
import { cn } from '@/lib/utils';
import { CUSTOMER_ACTIVITY_BADGE } from '@/utils/constants/dashboard.constant';
import type { CustomerActivityStatus } from '@/utils/enums/dashboard.enum';
import { formatCurrency, formatDate } from '@/utils/helper/common.helper';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardCard from './DashboardCard';
import DashboardErrorState from './DashboardErrorState';
import StatSectionCard from './StatSectionCard';

type Props = {
  /** Partial match on the sales representative name; empty means every customer. */
  salesRep: string;
};

const translateStatus = (t: TFunction<'dashboard'>, status: CustomerActivityStatus | string) =>
  t(`statistics.activity.${status}` as 'statistics.activity.active');

const CustomerStatistics = ({ salesRep }: Props) => {
  const { t } = useTranslation('dashboard');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const { data, isLoading, isError, isFetching, refetch } = useDashboardCustomerStaticQuery({
    sales_representative: salesRep || undefined,
  });

  const columns = useMemo<ColumnDef<CustomerStaticDetailRESP>[]>(
    () => [
      {
        header: t('statistics.column.customer'),
        cell: ({ row }) => <span className='font-medium text-gray-900'>{row.original.customer_name}</span>,
        meta: { width: '200px' },
      },
      {
        header: t('statistics.column.status'),
        cell: ({ row }) => (
          <Badge variant='secondary' className={cn('text-xs', CUSTOMER_ACTIVITY_BADGE[row.original.status])}>
            {translateStatus(t, row.original.status)}
          </Badge>
        ),
        meta: { align: 'center', width: '110px' },
      },
      {
        header: t('statistics.column.orders'),
        cell: ({ row }) => row.original.orders.toLocaleString(),
        meta: { align: 'center', width: '90px' },
      },
      {
        header: t('statistics.column.cumulative_sales'),
        cell: ({ row }) => formatCurrency(row.original.cumulative_sales),
        meta: { align: 'right', width: '160px' },
      },
      {
        header: t('statistics.column.aov'),
        cell: ({ row }) => formatCurrency(row.original.aov),
        meta: { align: 'right', width: '150px' },
      },
      {
        header: t('statistics.column.sales_rep'),
        cell: ({ row }) => row.original.sales_rep || '-',
        meta: { width: '150px' },
      },
      {
        header: t('statistics.column.last_order'),
        cell: ({ row }) => formatDate(row.original.last_order ?? undefined),
        meta: { align: 'center', width: '150px' },
      },
    ],
    [t],
  );

  if (isError && !data) {
    return <DashboardErrorState title={t('statistics.error_title')} isFetching={isFetching} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 xl:grid-cols-2'>
          <Skeleton className='h-72 rounded-xl' />
          <Skeleton className='h-72 rounded-xl' />
        </div>
        <Skeleton className='h-96 rounded-xl' />
      </div>
    );
  }

  const summary = data?.summary;
  const details = data?.customer_details ?? [];
  const pageIndex = Math.min(pagination.pageIndex, Math.max(0, Math.ceil(details.length / pagination.pageSize) - 1));
  const pageRows = details.slice(pageIndex * pagination.pageSize, (pageIndex + 1) * pagination.pageSize);

  const activityBreakdown = Object.entries(data?.customer_activity_status ?? {}).map(([status, item]) => ({
    label: translateStatus(t, status),
    count: item.value,
    pct: item.percentage,
  }));

  const byRep = details.reduce<Record<string, number>>((acc, detail) => {
    const rep = detail.sales_rep || t('statistics.unassigned');
    acc[rep] = (acc[rep] ?? 0) + 1;
    return acc;
  }, {});
  const repBreakdown = Object.entries(byRep)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      pct: details.length ? Math.round((count / details.length) * 1000) / 10 : 0,
    }));
  const assignedCount = details.filter((detail) => detail.sales_rep).length;

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 xl:grid-cols-2'>
        <StatSectionCard
          title={t('statistics.activity_title')}
          desc={t('statistics.activity_desc')}
          totalLabel={t('statistics.summary.total_customers')}
          total={summary ? formatMetricValue(summary.total_customers.value, summary.total_customers.unit) : '-'}
          stats={
            summary
              ? [
                  `${t('statistics.summary.new_customers')}: ${formatMetricValue(summary.new_customers.value, summary.new_customers.unit)}`,
                  `${t('statistics.summary.active_rate')}: ${formatMetricValue(summary.active_rate.value, summary.active_rate.unit)}`,
                  `${t('statistics.summary.avg_ltv')}: ${formatMetricValue(summary.avg_ltv.value, summary.avg_ltv.unit)}`,
                ]
              : undefined
          }
          breakdown={activityBreakdown}
        />

        <StatSectionCard
          title={t('statistics.sales_rep_title')}
          desc={t('statistics.sales_rep_desc')}
          totalLabel={t('statistics.assigned_customers')}
          total={`${assignedCount.toLocaleString()} / ${details.length.toLocaleString()}`}
          breakdown={repBreakdown}
        />
      </div>

      <DashboardCard title={t('statistics.detail_title')} icon={Users} contentClassName='p-5'>
        <DataTable
          data={pageRows}
          columns={columns}
          totalRows={details.length}
          pagination={{ ...pagination, pageIndex }}
          onPaginationChange={setPagination}
          getRowId={(row) => String(row.customer_id)}
          isLoading={isFetching}
          emptyMessage={t('statistics.empty')}
        />
      </DashboardCard>
    </div>
  );
};

export default CustomerStatistics;
