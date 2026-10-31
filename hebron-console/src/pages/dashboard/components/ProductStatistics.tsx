import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardProductStaticQuery } from '@/data/dashboard/dashboard.query';
import type { ProductStaticCtrRESP, ProductStaticItemRESP } from '@/data/dashboard/dashboard.response';
import { getPeriodRange } from '@/data/dashboard/dashboard.service';
import type { DashboardPeriod } from '@/utils/enums/dashboard.enum';
import { formatCurrency } from '@/utils/helper/common.helper';
import { getCategoryName } from '@/utils/helper/localized-text.helper';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardErrorState from './DashboardErrorState';
import StatSectionCard from './StatSectionCard';

type Props = {
  period: DashboardPeriod;
  /** Top-N asked from the API, picked in the filter bar. */
  limit: number;
};

const BREAKDOWN_LIMIT = 8;

function sum<T>(items: T[], pick: (item: T) => number) {
  return items.reduce((total, item) => total + (pick(item) || 0), 0);
}

const toPercent = (value: number, total: number) => (total ? Math.round((value / total) * 1000) / 10 : 0);

const ProductStatistics = ({ period, limit }: Props) => {
  const { t, i18n } = useTranslation('dashboard');

  const range = useMemo(() => getPeriodRange(period), [period]);
  const { data, isLoading, isError, isFetching, refetch } = useDashboardProductStaticQuery({ ...range, limit });

  if (isError && !data) {
    return <DashboardErrorState title={t('statistics.product.error_title')} isFetching={isFetching} onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return (
      <div className='grid gap-4 xl:grid-cols-2'>
        <Skeleton className='h-96 rounded-xl' />
        <Skeleton className='h-96 rounded-xl' />
      </div>
    );
  }

  const productName = (item: ProductStaticItemRESP | ProductStaticCtrRESP) =>
    getCategoryName(item, i18n.language, item.name || '-');

  const salesVolume = data?.sales_volume ?? [];
  const topProducts = data?.top_n_products ?? [];
  const promoted = data?.promoted_products_ctr ?? [];

  const totalQuantity = sum(salesVolume, (item) => item.total_quantity);
  const totalRevenue = sum(salesVolume, (item) => item.total_revenue);
  const totalExposure = sum(promoted, (item) => item.exposure_count);
  const totalClicks = sum(promoted, (item) => item.click_count);

  // The API already trims this list to the picked limit, so show it whole.
  const topBreakdown = topProducts.map((item) => ({
    label: `${item.rank ?? '-'}. ${productName(item)}`,
    count: item.total_quantity.toLocaleString(),
    pct: toPercent(item.total_quantity, totalQuantity),
  }));

  const revenueBreakdown = [...salesVolume]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, BREAKDOWN_LIMIT)
    .map((item) => ({
      label: productName(item),
      count: formatCurrency(item.total_revenue),
      pct: toPercent(item.total_revenue, totalRevenue),
    }));

  // Promoted products are ranked by CTR; exposure breaks the tie while everything sits at 0%.
  const ctrBreakdown = [...promoted]
    .sort((a, b) => b.ctr - a.ctr || b.exposure_count - a.exposure_count)
    .slice(0, BREAKDOWN_LIMIT)
    .map((item) => ({
      label: productName(item),
      hint: t('statistics.product.ctr_hint', {
        clicks: item.click_count.toLocaleString(),
        exposures: item.exposure_count.toLocaleString(),
      }),
      pct: item.ctr,
    }));

  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <StatSectionCard
        title={t('statistics.product.top_title')}
        desc={t('statistics.product.top_desc', { count: limit })}
        totalLabel={t('statistics.product.total_quantity')}
        total={totalQuantity.toLocaleString()}
        stats={[
          `${t('statistics.product.total_revenue')}: ${formatCurrency(totalRevenue)}`,
          `${t('statistics.product.sold_products')}: ${salesVolume.length.toLocaleString()}`,
        ]}
        breakdown={topBreakdown}
      />

      <StatSectionCard
        title={t('statistics.product.revenue_title')}
        desc={t('statistics.product.revenue_desc')}
        totalLabel={t('statistics.product.total_revenue')}
        total={formatCurrency(totalRevenue)}
        breakdown={revenueBreakdown}
      />

      <StatSectionCard
        title={t('statistics.product.ctr_title')}
        desc={t('statistics.product.ctr_desc')}
        totalLabel={t('statistics.product.total_exposure')}
        total={totalExposure.toLocaleString()}
        stats={[
          `${t('statistics.product.total_clicks')}: ${totalClicks.toLocaleString()}`,
          `${t('statistics.product.avg_ctr')}: ${toPercent(totalClicks, totalExposure)}%`,
        ]}
        breakdown={ctrBreakdown}
      />
    </div>
  );
};

export default ProductStatistics;
