import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardPaymentStaticQuery } from '@/data/dashboard/dashboard.query';
import { buildPaymentMethodBreakdown, buildPaymentPeriodRows, getPaymentRange } from '@/data/dashboard/dashboard.service';
import { PAYMENT_STATUS_COLORS } from '@/utils/constants/dashboard.constant';
import type { PaymentStatPeriod } from '@/utils/enums/dashboard.enum';
import { formatCurrency } from '@/utils/helper/common.helper';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardErrorState from './DashboardErrorState';
import StatSectionCard, { type StatChartSeries } from './StatSectionCard';

type Props = {
  period: PaymentStatPeriod;
};

const STATUS_KEYS = ['successful', 'failed', 'refunded'] as const;

const PaymentStatistics = ({ period }: Props) => {
  const { t } = useTranslation('dashboard');

  const range = useMemo(() => getPaymentRange(period), [period]);
  const { data, isLoading, isError, isFetching, refetch } = useDashboardPaymentStaticQuery({ period, ...range });

  const chartSeries = useMemo<StatChartSeries[]>(
    () => [
      { key: 'total', label: t('statistics.payment.total_payments'), color: PAYMENT_STATUS_COLORS.total },
      { key: 'successful', label: t('statistics.payment.successful'), color: PAYMENT_STATUS_COLORS.successful },
    ],
    [t],
  );
  const chartRows = useMemo(() => buildPaymentPeriodRows(data?.period_breakdown), [data]);

  if (isError && !data) {
    return <DashboardErrorState title={t('statistics.payment.error_title')} isFetching={isFetching} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className='grid gap-4 xl:grid-cols-2'>
        <Skeleton className='h-96 rounded-xl' />
        <Skeleton className='h-96 rounded-xl' />
      </div>
    );
  }

  const status = data?.payment_status_statistics;
  const methods = Object.values(data?.sales_statistics ?? {});
  const totalCount = methods.reduce((sum, method) => sum + (method.total_count ?? 0), 0);
  const totalAmount = methods.reduce((sum, method) => sum + Number(method.total_amount ?? 0), 0);

  const statusBreakdown = STATUS_KEYS.map((key) => ({
    label: t(`statistics.payment.${key}` as 'statistics.payment.successful'),
    count: status?.[key]?.count ?? 0,
    pct: status?.[key]?.percentage_count ?? 0,
  }));

  const methodBreakdown = buildPaymentMethodBreakdown(data?.sales_statistics);

  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <StatSectionCard
        title={t('statistics.payment.status_title')}
        desc={t('statistics.payment.status_desc')}
        totalLabel={t('statistics.payment.total_payments')}
        total={totalCount.toLocaleString()}
        stats={
          status
            ? [
                `${t('statistics.payment.successful')}: ${formatCurrency(status.successful.amount ?? 0)}`,
                `${t('statistics.payment.failed')}: ${(status.failed.count ?? 0).toLocaleString()}`,
                `${t('statistics.payment.refunded')}: ${(status.refunded.count ?? 0).toLocaleString()}`,
              ]
            : undefined
        }
        chart={{ rows: chartRows, series: chartSeries }}
        breakdown={statusBreakdown}
      />

      <StatSectionCard
        title={t('statistics.payment.method_title')}
        desc={t('statistics.payment.method_desc')}
        totalLabel={t('statistics.payment.total_amount')}
        total={formatCurrency(totalAmount)}
        breakdown={methodBreakdown}
      />
    </div>
  );
};

export default PaymentStatistics;
