import { DASHBOARD_PERIOD_DAYS } from '@/utils/constants/dashboard.constant';
import { PaymentStatPeriod, type DashboardPeriod } from '@/utils/enums/dashboard.enum';
import { formatCurrency } from '@/utils/helper/common.helper';
import dayjs from 'dayjs';
import type {
  DashboardGraphBucketRESP,
  DashboardGraphMetricKey,
  DashboardGraphSeriesRESP,
  DashboardMemberStaticRESP,
  DashboardMetricRESP,
  DashboardOperationRESP,
  MemberStaticPointRESP,
  OrderStaticChartBucketRESP,
  OrderStaticSalesItemRESP,
  PaymentMethodStatRESP,
  PaymentPeriodBreakdownRESP,
} from './dashboard.response';

export type OperationMetricCard = {
  key: string;
  label: string;
  value: string;
  change?: number;
  trend: number[];
};

const GRAPH_KEYS: DashboardGraphMetricKey[] = ['sales', 'members', 'orders', 'payments', 'reviews'];

/** `data` comes back as an array for some series and as a date-keyed object for others. */
export const toGraphPoints = (series?: DashboardGraphSeriesRESP) => {
  const data = series?.data ?? [];
  return Array.isArray(data) ? data : Object.values(data);
};

export const formatMetricValue = (value: number, unit: DashboardMetricRESP['unit']) => {
  if (unit === 'amount') return formatCurrency(value);
  if (unit === 'percent') return `${value}%`;
  if (unit === 'hours') return `${value}h`;
  return value.toLocaleString();
};

/** Sparkline values: sales trends on amount, every other metric on count. */
export const getMetricTrend = (bucket?: DashboardGraphBucketRESP, key?: DashboardGraphMetricKey) => {
  if (!key) return [];
  return toGraphPoints(bucket?.[key]).map((point) => Number((key === 'sales' ? point.total_amount : point.total) ?? 0));
};

export const buildOperationMetricCards = (data?: DashboardOperationRESP): OperationMetricCard[] => {
  const metric = data?.metric;
  if (!metric) return [];

  const daily = data.graph_data?.daily;
  const toCard = (key: string, item?: DashboardMetricRESP, trendKey?: DashboardGraphMetricKey) =>
    item
      ? {
          key,
          label: item.label,
          value: formatMetricValue(item.current, item.unit),
          change: item.change,
          trend: getMetricTrend(daily, trendKey),
        }
      : null;

  return [
    toCard('sales', metric.sales, 'sales'),
    toCard('members', metric.members, 'members'),
    toCard('orders', metric.orders, 'orders'),
    toCard('payment_success', metric.payments?.success, 'payments'),
    toCard('outstanding', metric.payments?.outstanding),
    toCard('reviews', metric.reviews, 'reviews'),
  ].filter((card) => card !== null);
};

const emptyRow = (label: string, sortKey: string | number): Record<string, string | number> => ({
  label,
  sortKey,
  ...Object.fromEntries(GRAPH_KEYS.map((graphKey) => [graphKey, 0])),
});

/**
 * One row per date label, every series filled so the chart keeps a continuous line.
 * `days` seeds the whole period (the API only returns dates that have data) so the axis shows every date.
 */
export const buildOverviewRows = (bucket?: DashboardGraphBucketRESP, days?: number) => {
  const byLabel = new Map<string, Record<string, string | number>>();

  for (let offset = (days ?? 0) - 1; offset >= 0; offset--) {
    const date = dayjs().subtract(offset, 'day').format('YYYY-MM-DD');
    byLabel.set(date.slice(5, 10), emptyRow(date.slice(5, 10), date));
  }

  for (const key of GRAPH_KEYS) {
    for (const point of toGraphPoints(bucket?.[key])) {
      const label = point.date.slice(5, 10);
      const row = byLabel.get(label) ?? emptyRow(label, point.week ?? point.date);
      row[key] = Number(point.total ?? 0);
      byLabel.set(label, row);
    }
  }

  return [...byLabel.values()].sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0));
};

export const MEMBER_TREND_KEYS = ['new', 'active', 'withdrawn'] as const;

const MAX_SEEDED_TREND_DAYS = 400;

/** Every YYYY-MM-DD from `startDate` to `endDate`, inclusive. */
const eachDate = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  let day = dayjs(startDate);
  const last = dayjs(endDate);

  for (let i = 0; i < MAX_SEEDED_TREND_DAYS && !day.isAfter(last, 'day'); i++) {
    dates.push(day.format('YYYY-MM-DD'));
    day = day.add(1, 'day');
  }

  return dates;
};

const countByDate = (points: MemberStaticPointRESP[] = []) =>
  points.reduce<Record<string, number>>((acc, point) => {
    acc[point.date] = (acc[point.date] ?? 0) + (point.count ?? 0);
    return acc;
  }, {});

/** One row per day of the selected range — the API only returns days that have members. */
export const buildMemberTrendRows = (data?: DashboardMemberStaticRESP, startDate?: string, endDate?: string) => {
  if (!data) return [];

  const byKey = {
    new: countByDate(data.new_members),
    active: countByDate(data.active_members),
    withdrawn: countByDate(data.withdrawn_members),
  };

  const dates = new Set(MEMBER_TREND_KEYS.flatMap((key) => Object.keys(byKey[key])));
  if (startDate && endDate) {
    for (const date of eachDate(startDate, endDate)) dates.add(date);
  }

  return [...dates].sort().map((date) => ({
    label: date.slice(5),
    new: byKey.new[date] ?? 0,
    active: byKey.active[date] ?? 0,
    withdrawn: byKey.withdrawn[date] ?? 0,
  }));
};

/** The statistics APIs take an explicit range, while the UI filters by the same 7d / 30d periods. */
export const getPeriodRange = (period: DashboardPeriod) => ({
  start_date: dayjs()
    .subtract(DASHBOARD_PERIOD_DAYS[period] - 1, 'day')
    .format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
});

/** Order count per bucket; daily buckets seed the whole range so the axis stays continuous. */
export const buildOrderChartRows = (bucket?: OrderStaticChartBucketRESP, range?: { start_date: string; end_date: string }) => {
  const byDate = new Map<string, number>();

  if (range) for (const date of eachDate(range.start_date, range.end_date)) byDate.set(date, 0);
  for (const point of bucket?.data ?? []) {
    const date = point.date.slice(0, 10);
    byDate.set(date, (byDate.get(date) ?? 0) + (point.total ?? 0));
  }

  return [...byDate.keys()].sort().map((date) => ({ label: date.slice(5), value: byDate.get(date) ?? 0 }));
};

/** Breakdown items for a sales-analytics list, biggest amount first. */
export const buildSalesBreakdown = (items: OrderStaticSalesItemRESP[] = [], limit = 8) => {
  const totalAmount = items.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0);

  return [...items]
    .sort((a, b) => Number(b.total_amount ?? 0) - Number(a.total_amount ?? 0))
    .slice(0, limit)
    .map((item) => ({
      label: item.name,
      count: formatCurrency(Number(item.total_amount ?? 0)),
      pct: totalAmount ? Math.round((Number(item.total_amount ?? 0) / totalAmount) * 1000) / 10 : 0,
    }));
};

// Each granularity gets a range wide enough to plot: 12 months, 8 quarters, 5 years.
const PAYMENT_RANGE_MONTHS: Record<PaymentStatPeriod, number> = {
  [PaymentStatPeriod.MONTHLY]: 12,
  [PaymentStatPeriod.QUARTERLY]: 24,
  [PaymentStatPeriod.YEARLY]: 60,
};

/** The payment API takes an explicit range; the UI only picks the granularity. */
export const getPaymentRange = (period: PaymentStatPeriod) => ({
  date_from: dayjs()
    .subtract(PAYMENT_RANGE_MONTHS[period] - 1, 'month')
    .startOf('month')
    .format('YYYY-MM-DD'),
  date_to: dayjs().endOf('month').format('YYYY-MM-DD'),
});

/** Payment counts per period bucket, oldest first. */
export const buildPaymentPeriodRows = (breakdown: PaymentPeriodBreakdownRESP[] = []) =>
  [...breakdown]
    .sort((a, b) => (a.period < b.period ? -1 : a.period > b.period ? 1 : 0))
    .map((item) => ({
      label: item.period,
      total: item.total_count ?? 0,
      successful: item.successful_count ?? 0,
    }));

/** Breakdown per payment method, biggest amount first. */
export const buildPaymentMethodBreakdown = (methods: Record<string, PaymentMethodStatRESP> = {}) =>
  Object.values(methods)
    .sort((a, b) => Number(b.total_amount ?? 0) - Number(a.total_amount ?? 0))
    .map((method) => ({
      label: method.payment_method_label || method.payment_method,
      count: formatCurrency(Number(method.total_amount ?? 0)),
      pct: method.amount_percentage ?? 0,
    }));
