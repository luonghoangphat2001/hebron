import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMemberStaticQuery } from '@/data/dashboard/dashboard.query';
import type { DashboardMemberStaticRESP } from '@/data/dashboard/dashboard.response';
import { buildMemberTrendRows, getPeriodRange } from '@/data/dashboard/dashboard.service';
import { MEMBER_TREND_COLORS } from '@/utils/constants/dashboard.constant';
import type { DashboardPeriod } from '@/utils/enums/dashboard.enum';
import type { TFunction } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardErrorState from './DashboardErrorState';
import StatSectionCard, { type StatChartSeries } from './StatSectionCard';

type Props = {
  period: DashboardPeriod;
};

const toPercent = (count: number, total: number) => (total ? Math.round((count / total) * 1000) / 10 : 0);

/** Counts rows per group key, biggest group first. */
function groupCount<T>(items: T[], keyOf: (item: T) => string) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = keyOf(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

const buildPathBreakdown = (t: TFunction<'dashboard'>, paths: DashboardMemberStaticRESP['members_by_path']) =>
  groupCount(paths, (item) => item.path).map(([path, count]) => ({
    // Paths are open-ended, so an unknown one falls back to the raw value.
    label: t(`statistics.member.path.${path}` as 'statistics.member.path.direct', { defaultValue: path }),
    count,
    pct: toPercent(count, paths.length),
  }));

const buildLevelBreakdown = (t: TFunction<'dashboard'>, levels: DashboardMemberStaticRESP['members_by_level']) =>
  groupCount(levels, (item) => (item.level === null ? '' : String(item.level))).map(([level, count]) => ({
    label: level ? t('statistics.member.level_value', { level }) : t('statistics.member.no_level'),
    count,
    pct: toPercent(count, levels.length),
  }));

const MemberStatistics = ({ period }: Props) => {
  const { t } = useTranslation('dashboard');
  const range = useMemo(() => getPeriodRange(period), [period]);
  const { data, isLoading, isError, isFetching, refetch } = useDashboardMemberStaticQuery(range);

  const trendSeries = useMemo<StatChartSeries[]>(
    () => [
      { key: 'new', label: t('statistics.member.new'), color: MEMBER_TREND_COLORS.new },
      { key: 'active', label: t('statistics.member.active'), color: MEMBER_TREND_COLORS.active },
      { key: 'withdrawn', label: t('statistics.member.withdrawn'), color: MEMBER_TREND_COLORS.withdrawn },
    ],
    [t],
  );
  const trendRows = useMemo(() => buildMemberTrendRows(data, range.start_date, range.end_date), [data, range]);

  if (isError && !data) {
    return <DashboardErrorState title={t('statistics.member.error_title')} isFetching={isFetching} onRetry={() => refetch()} />;
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
  const newCount = data?.new_members.length ?? 0;
  const activeCount = data?.active_members.length ?? 0;
  const withdrawnCount = data?.withdrawn_members.length ?? 0;
  const accountTotal = newCount + activeCount + withdrawnCount;

  const accountBreakdown = [
    { label: t('statistics.member.new'), count: newCount, pct: toPercent(newCount, accountTotal) },
    { label: t('statistics.member.active'), count: activeCount, pct: toPercent(activeCount, accountTotal) },
    { label: t('statistics.member.withdrawn'), count: withdrawnCount, pct: toPercent(withdrawnCount, accountTotal) },
  ];

  const pathBreakdown = buildPathBreakdown(t, data?.members_by_path ?? []);
  const levelBreakdown = buildLevelBreakdown(t, data?.members_by_level ?? []);

  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <StatSectionCard
        title={t('statistics.member.account_title')}
        desc={t('statistics.member.account_desc')}
        totalLabel={t('statistics.member.total_new')}
        total={(summary?.total_new_members.total ?? 0).toLocaleString()}
        stats={
          summary
            ? [
                `${t('statistics.member.net_growth')}: ${summary.net_growth.total.toLocaleString()}`,
                `${t('statistics.member.avg_new_per_day')}: ${summary.avg_new_members_per_day.total.toLocaleString()}`,
                `${t('statistics.member.avg_active_per_day')}: ${summary.avg_active_members_per_day.total.toLocaleString()}`,
              ]
            : undefined
        }
        chart={{ rows: trendRows, series: trendSeries }}
        breakdown={accountBreakdown}
      />

      <StatSectionCard
        title={t('statistics.member.path_title')}
        desc={t('statistics.member.path_desc')}
        totalLabel={t('statistics.member.total_members')}
        total={(summary?.total_members.total ?? 0).toLocaleString()}
        breakdown={pathBreakdown}
      />

      <StatSectionCard
        title={t('statistics.member.level_title')}
        desc={t('statistics.member.level_desc')}
        totalLabel={t('statistics.member.total_members')}
        total={(data?.members_by_level.length ?? 0).toLocaleString()}
        breakdown={levelBreakdown}
      />
    </div>
  );
};

export default MemberStatistics;
