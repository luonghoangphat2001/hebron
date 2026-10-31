import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardInquiryStaticQuery } from '@/data/dashboard/dashboard.query';
import type {
  DashboardInquiryStaticRESP,
  InquiryPersonStatRESP,
  InquirySummaryItemRESP,
} from '@/data/dashboard/dashboard.response';
import { formatMetricValue, getPeriodRange } from '@/data/dashboard/dashboard.service';
import type { DashboardPeriod } from '@/utils/enums/dashboard.enum';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardErrorState from './DashboardErrorState';
import StatSectionCard from './StatSectionCard';

type Props = {
  period: DashboardPeriod;
};

const toPercent = (count: number, total: number) => (total ? Math.round((count / total) * 1000) / 10 : 0);

const personName = (person: InquiryPersonStatRESP['person_in_charge']) =>
  typeof person === 'object' && person !== null ? person.name : person;

const InquiryStatistics = ({ period }: Props) => {
  const { t } = useTranslation('dashboard');
  const { t: tEnum } = useTranslation('enum');

  const range = useMemo(() => getPeriodRange(period), [period]);
  const { data, isLoading, isError, isFetching, refetch } = useDashboardInquiryStaticQuery({ period, ...range });

  if (isError && !data) {
    return <DashboardErrorState title={t('statistics.inquiry.error_title')} isFetching={isFetching} onRetry={() => refetch()} />;
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
  const total = data?.total_inquiries ?? 0;

  // The API labels are English shouty-case; translate by key and keep them as the fallback.
  const summaryLabel = (key: keyof DashboardInquiryStaticRESP['summary'], item?: InquirySummaryItemRESP) =>
    t(`statistics.inquiry.${key}` as 'statistics.inquiry.total_inquiries', { defaultValue: item?.label ?? '' });
  const summaryStat = (key: keyof DashboardInquiryStaticRESP['summary']) => {
    const item = summary?.[key];
    return item ? `${summaryLabel(key, item)}: ${formatMetricValue(item.value, item.unit)}` : '';
  };

  const typeBreakdown = (data?.by_inquiry_type ?? []).map((item) => ({
    label: tEnum(`inquiry.${item.type}` as 'inquiry.product', { defaultValue: item.label }),
    count: item.count,
    pct: toPercent(item.count, total),
  }));

  const statusBreakdown = (data?.by_processing_status ?? []).map((item) => ({
    label: tEnum(`inquiry.${item.status}` as 'inquiry.pending', { defaultValue: item.label }),
    count: item.count,
    pct: item.percentage ?? toPercent(item.count, total),
  }));

  const handledTotal = (data?.by_person_in_charge ?? []).reduce((sum, item) => sum + (item.cases_processed ?? 0), 0);
  const personBreakdown = (data?.by_person_in_charge ?? []).map((item) => ({
    label: personName(item.person_in_charge) || t('statistics.inquiry.unassigned'),
    count: item.cases_processed ?? 0,
    pct: toPercent(item.cases_processed ?? 0, handledTotal),
  }));

  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <StatSectionCard
        title={t('statistics.inquiry.type_title')}
        desc={t('statistics.inquiry.type_desc')}
        totalLabel={summaryLabel('total_inquiries', summary?.total_inquiries)}
        total={total.toLocaleString()}
        stats={[summaryStat('resolution_rate'), summaryStat('avg_processing_time'), summaryStat('unassigned')].filter(Boolean)}
        breakdown={typeBreakdown}
      />

      <StatSectionCard
        title={t('statistics.inquiry.status_title')}
        desc={t('statistics.inquiry.status_desc')}
        totalLabel={summaryLabel('total_inquiries', summary?.total_inquiries)}
        total={total.toLocaleString()}
        breakdown={statusBreakdown}
      />

      {personBreakdown.length > 0 && (
        <StatSectionCard
          title={t('statistics.inquiry.person_title')}
          desc={t('statistics.inquiry.person_desc')}
          totalLabel={t('statistics.inquiry.handled')}
          total={handledTotal.toLocaleString()}
          breakdown={personBreakdown}
        />
      )}
    </div>
  );
};

export default InquiryStatistics;
