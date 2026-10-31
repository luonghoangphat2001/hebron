import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import BreakdownList, { type BreakdownItem } from './BreakdownList';
import DashboardCard from './DashboardCard';

export type StatChartSeries = {
  key: string;
  label: string;
  color: string;
};

type Props = {
  title: string;
  desc: string;
  totalLabel?: string;
  total: string;
  change?: number;
  /** Small outline badges under the total, e.g. "Net growth: 12". */
  stats?: string[];
  chart?: { rows: Record<string, string | number>[]; series: StatChartSeries[] };
  breakdown: BreakdownItem[];
};

const MAX_TICKS = 8;

/** Shared statistics section: total on the left (with an optional trend) and a breakdown on the right. */
const StatSectionCard = ({ title, desc, totalLabel, total, change, stats, chart, breakdown }: Props) => {
  const { t } = useTranslation('dashboard');
  const isPositive = (change ?? 0) >= 0;

  const chartConfig = useMemo<ChartConfig>(
    () => Object.fromEntries((chart?.series ?? []).map((s) => [s.key, { label: s.label, color: s.color }])),
    [chart?.series],
  );
  // interval is "ticks skipped between labels", so 30 rows / 8 labels => skip 3.
  const tickInterval = Math.max(0, Math.ceil((chart?.rows.length ?? 0) / MAX_TICKS) - 1);

  return (
    <DashboardCard
      title={title}
      icon={BarChart3}
      description={desc}
      extra={
        change !== undefined && (
          <Badge
            variant='secondary'
            className={cn(
              'shrink-0 gap-1',
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive',
            )}>
            {isPositive ? <ArrowUpRight className='size-3' /> : <ArrowDownRight className='size-3' />}
            {Math.abs(change)}%
          </Badge>
        )
      }>
      <div className='grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]'>
        <div className='min-w-0'>
          <p className='text-muted-foreground text-sm font-medium'>{totalLabel ?? t('statistics.total')}</p>
          <p className='mt-1 truncate text-2xl font-semibold text-gray-950'>{total}</p>

          {stats?.length ? (
            <div className='mt-2 flex flex-wrap gap-2'>
              {stats.map((stat) => (
                <Badge key={stat} variant='outline' className='text-muted-foreground font-normal'>
                  {stat}
                </Badge>
              ))}
            </div>
          ) : null}

          {chart?.rows.length ? (
            <ChartContainer config={chartConfig} className='mt-5 h-52 w-full'>
              {/* right margin keeps the last date label from being clipped by the chart edge */}
              <LineChart data={chart.rows} margin={{ left: 8, right: 24, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={tickInterval}
                  minTickGap={8}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  allowDecimals={false}
                  tickFormatter={(v) => Number(v).toLocaleString()}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {chart.series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
                {chart.series.map((s) => (
                  <Line key={s.key} type='linear' dataKey={s.key} stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ChartContainer>
          ) : null}
        </div>

        <div className='rounded-lg border border-gray-100 bg-gray-50/60 p-4'>
          <BreakdownList items={breakdown} />
        </div>
      </div>
    </DashboardCard>
  );
};

export default StatSectionCard;
