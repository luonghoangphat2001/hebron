import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardOrderStaticQuery } from '@/data/dashboard/dashboard.query';
import { buildOrderChartRows, buildSalesBreakdown, getPeriodRange } from '@/data/dashboard/dashboard.service';
import { DashboardGroupBy, type DashboardPeriod } from '@/utils/enums/dashboard.enum';
import { formatCurrency } from '@/utils/helper/common.helper';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BreakdownItem } from './BreakdownList';
import DashboardErrorState from './DashboardErrorState';
import StatSectionCard, { type StatChartSeries } from './StatSectionCard';

type Props = {
  period: DashboardPeriod;
  groupBy: DashboardGroupBy;
};

const ORDER_TREND_COLOR = '#6366f1';

const OrderStatistics = ({ period, groupBy }: Props) => {
  const { t } = useTranslation('dashboard');
  const { t: tEnum } = useTranslation('enum');

  const range = useMemo(() => getPeriodRange(period), [period]);
  const { data, isLoading, isError, isFetching, refetch } = useDashboardOrderStaticQuery({ period });

  const isWeekly = groupBy === DashboardGroupBy.WEEKLY;
  const chartSeries = useMemo<StatChartSeries[]>(
    () => [{ key: 'value', label: t('statistics.order.orders'), color: ORDER_TREND_COLOR }],
    [t],
  );
  const chartRows = useMemo(
    () => buildOrderChartRows(isWeekly ? data?.chart?.weekly : data?.chart?.daily, isWeekly ? undefined : range),
    [data, isWeekly, range],
  );

  if (isError && !data) {
    return <DashboardErrorState title={t('statistics.order.error_title')} isFetching={isFetching} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className='grid gap-4 xl:grid-cols-2'>
        <Skeleton className='h-96 rounded-xl' />
        <Skeleton className='h-96 rounded-xl' />
      </div>
    );
  }

  const summary = data?.summary;
  // The API sends a percentage per status; statuses at 0% would only add noise.
  const statusBreakdown: BreakdownItem[] = Object.entries(data?.ratios_order_status ?? {})
    .filter(([, ratio]) => ratio > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([status, ratio]) => ({ label: tEnum(`order.${status}` as 'order.draft'), pct: ratio }));

  const productBreakdown = buildSalesBreakdown(data?.sales_analytics?.product);
  const categoryBreakdown = buildSalesBreakdown(data?.sales_analytics?.category);
  const customerBreakdown = buildSalesBreakdown(data?.sales_analytics?.users);

  const salesTotal = (items: { total_amount: number }[] = []) =>
    formatCurrency(items.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0));

  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <StatSectionCard
        title={t('statistics.order.orders_title')}
        desc={t('statistics.order.orders_desc')}
        totalLabel={t('statistics.order.total_orders')}
        total={(summary?.orders.total ?? 0).toLocaleString()}
        change={summary?.orders.change}
        stats={
          summary
            ? [
                `${t('statistics.order.order_amount')}: ${formatCurrency(Number(summary.orders.total_amount ?? 0))}`,
                `${t('statistics.order.sales')}: ${summary.sales.total.toLocaleString()}`,
                `${t('statistics.order.cancellations_returns')}: ${summary.cancellations_returns.total.toLocaleString()}`,
              ]
            : undefined
        }
        chart={{ rows: chartRows, series: chartSeries }}
        breakdown={statusBreakdown}
      />

      <StatSectionCard
        title={t('statistics.order.product_title')}
        desc={t('statistics.order.product_desc')}
        totalLabel={t('statistics.order.product_sales')}
        total={salesTotal(data?.sales_analytics?.product)}
        breakdown={productBreakdown}
      />

      <StatSectionCard
        title={t('statistics.order.category_title')}
        desc={t('statistics.order.category_desc')}
        totalLabel={t('statistics.order.category_sales')}
        total={salesTotal(data?.sales_analytics?.category)}
        breakdown={categoryBreakdown}
      />

      <StatSectionCard
        title={t('statistics.order.customer_title')}
        desc={t('statistics.order.customer_desc')}
        totalLabel={t('statistics.order.customer_sales')}
        total={salesTotal(data?.sales_analytics?.users)}
        breakdown={customerBreakdown}
      />
    </div>
  );
};

export default OrderStatistics;
