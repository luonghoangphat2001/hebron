import PageTitle from '@/components/PageTitle';
import AppSelect from '@/components/select/AppSelect';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardOperationQuery } from '@/data/dashboard/dashboard.query';
import { buildOperationMetricCards, buildOverviewRows, type OperationMetricCard } from '@/data/dashboard/dashboard.service';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_GROUP_BY_VALUES,
  DASHBOARD_METRIC_CONFIG,
  DASHBOARD_NOTIFICATIONS,
  DASHBOARD_OVERVIEW_SERIES,
  DASHBOARD_PERIOD_DAYS,
  DASHBOARD_PERIOD_VALUES,
} from '@/utils/constants/dashboard.constant';
import { DashboardGroupBy, DashboardPeriod } from '@/utils/enums/dashboard.enum';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import DashboardCard from './components/DashboardCard';
import DashboardErrorState from './components/DashboardErrorState';
import TinySparkline from './components/TinySparkline';

function KpiCardItem({ card, periodLabel }: { card: OperationMetricCard; periodLabel: string }) {
  const { t } = useTranslation('dashboard');
  const config = DASHBOARD_METRIC_CONFIG[card.key] ?? DASHBOARD_METRIC_CONFIG.default;
  const isPositive = (card.change ?? 0) >= 0;

  return (
    <Card size='sm' className='min-h-40 border-gray-200 bg-white shadow-sm'>
      <CardContent className='flex flex-1 flex-col justify-between'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            {/* Falls back to the label the API sends for metrics we have no translation for. */}
            <p className='text-muted-foreground truncate text-sm font-medium'>
              {t(`metric.${card.key}` as 'metric.sales', { defaultValue: card.label })}
            </p>
            <p className='mt-2 truncate text-2xl font-semibold text-gray-950'>{card.value}</p>
          </div>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-white',
              config.gradient,
            )}>
            <config.icon className='size-5' />
          </div>
        </div>

        <div className='mt-4 space-y-2'>
          <TinySparkline data={card.trend} color={config.lineColor} />
          <div className='flex items-center justify-between gap-2 text-xs'>
            <span className='text-muted-foreground truncate'>{periodLabel}</span>
            {card.change !== undefined && (
              <Badge
                variant='secondary'
                className={cn(
                  'shrink-0 gap-1',
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive',
                )}>
                {isPositive ? <ArrowUpRight className='size-3' /> : <ArrowDownRight className='size-3' />}
                {Math.abs(card.change)}%
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const OperationsDashboardPage = () => {
  const { t: tSidebar } = useTranslation('sidebar');
  const { t } = useTranslation('dashboard');
  const [period, setPeriod] = useState(DashboardPeriod.SEVEN_DAYS);
  const [groupBy, setGroupBy] = useState(DashboardGroupBy.DAILY);

  const { data, isLoading, isError, isFetching, refetch } = useDashboardOperationQuery({ period });

  const periodOptions = useMemo(
    () => DASHBOARD_PERIOD_VALUES.map((value) => ({ value, label: t(`filter.period.${value}` as 'filter.period.7d') })),
    [t],
  );
  const groupByOptions = useMemo(
    () => DASHBOARD_GROUP_BY_VALUES.map((value) => ({ value, label: t(`filter.group_by.${value}` as 'filter.group_by.daily') })),
    [t],
  );
  const overviewConfig = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        DASHBOARD_OVERVIEW_SERIES.map((s) => [s.key, { color: s.color, label: t(`metric.${s.key}` as 'metric.sales') }]),
      ),
    [t],
  );

  const metricCards = useMemo(() => buildOperationMetricCards(data), [data]);
  const overviewRows = useMemo(() => {
    const isWeekly = groupBy === DashboardGroupBy.WEEKLY;
    const bucket = isWeekly ? data?.graph_data?.weekly : data?.graph_data?.daily;
    return buildOverviewRows(bucket, isWeekly ? undefined : DASHBOARD_PERIOD_DAYS[period]);
  }, [data, groupBy, period]);
  const isDenseAxis = overviewRows.length > 12;

  const periodLabel = periodOptions.find((option) => option.value === period)?.label ?? '';

  return (
    <main className='space-y-6'>
      <header className='space-y-4'>
        <div className='space-y-1'>
          <PageTitle
            title={tSidebar('operations_dashboard')}
            extra={
              <AppSelect
                options={periodOptions}
                value={period}
                onChange={(v) => v && setPeriod(v)}
                clearable={false}
                className='w-44'
              />
            }
          />
          <p className='text-muted-foreground text-sm'>{t('operation.description')}</p>
        </div>
        <Separator />
      </header>

      {isError && !data ? (
        <DashboardErrorState title={t('operation.error_title')} isFetching={isFetching} onRetry={() => refetch()} />
      ) : (
        <>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className='h-40 rounded-xl' />)
              : metricCards.map((card) => <KpiCardItem key={card.key} card={card} periodLabel={periodLabel} />)}
          </div>

          <div className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]'>
            {isLoading ? (
              <Skeleton className='h-[430px] rounded-xl' />
            ) : (
              <DashboardCard
                title={t('operation.overview_title')}
                icon={TrendingUp}
                contentClassName='p-6'
                extra={
                  <AppSelect
                    options={groupByOptions}
                    value={groupBy}
                    onChange={(v) => v && setGroupBy(v)}
                    clearable={false}
                    className='w-36'
                  />
                }>
                <ChartContainer config={overviewConfig} className='h-[340px] w-full'>
                  {/* right margin keeps the last date label from being clipped by the chart edge */}
                  <LineChart data={overviewRows} margin={{ left: 8, right: 24, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis
                      dataKey='label'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval={0}
                      tick={{ fontSize: 11 }}
                      angle={isDenseAxis ? -45 : 0}
                      textAnchor={isDenseAxis ? 'end' : 'middle'}
                      height={isDenseAxis ? 56 : 30}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={56}
                      allowDecimals={false}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {DASHBOARD_OVERVIEW_SERIES.map((s) => (
                      <Line
                        key={s.key}
                        type='linear'
                        dataKey={s.key}
                        stroke={`var(--color-${s.key})`}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              </DashboardCard>
            )}

            {isLoading ? (
              <Skeleton className='h-[430px] rounded-xl' />
            ) : (
              <DashboardCard title={t('operation.notification_title')} contentClassName='p-0'>
                {DASHBOARD_NOTIFICATIONS.map((notification) => (
                  <div
                    key={notification.key}
                    className='flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4 last:border-b-0'>
                    <div className='flex min-w-0 items-start gap-3'>
                      <notification.icon className={cn('mt-0.5 size-5 shrink-0', notification.iconColor)} />
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-gray-900'>
                          {t(`notification.${notification.key}.label` as 'notification.inquiries_in_progress.label')}
                        </p>
                        <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                          {t(`notification.${notification.key}.desc` as 'notification.inquiries_in_progress.desc')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-sm font-bold',
                        notification.countColor,
                      )}>
                      {(data?.notifications_hot?.[notification.key] ?? 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </DashboardCard>
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default OperationsDashboardPage;
