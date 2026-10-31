import type { DashboardGraphMetricKey, DashboardNotificationsHotRESP } from '@/data/dashboard/dashboard.response';
import {
  AlertCircle,
  Bell,
  DollarSign,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { CustomerActivityStatus, DashboardGroupBy, DashboardPeriod, PaymentStatPeriod } from '../enums/dashboard.enum';

export const DASHBOARD_PERIOD_VALUES = [DashboardPeriod.SEVEN_DAYS, DashboardPeriod.THIRTY_DAYS];

export const DASHBOARD_GROUP_BY_VALUES = [DashboardGroupBy.DAILY, DashboardGroupBy.WEEKLY];

/** Used to seed every date of the selected period on the overview chart. */
export const DASHBOARD_PERIOD_DAYS: Record<DashboardPeriod, number> = {
  [DashboardPeriod.SEVEN_DAYS]: 7,
  [DashboardPeriod.THIRTY_DAYS]: 30,
};

export const DASHBOARD_METRIC_CONFIG: Record<string, { icon: LucideIcon; gradient: string; lineColor: string }> = {
  sales: { icon: DollarSign, gradient: 'from-orange-500 to-orange-600', lineColor: '#f97316' },
  members: { icon: Users, gradient: 'from-teal-500 to-teal-600', lineColor: '#0d9488' },
  orders: { icon: ShoppingCart, gradient: 'from-purple-500 to-purple-600', lineColor: '#a855f7' },
  payment_success: { icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', lineColor: '#10b981' },
  outstanding: { icon: Package, gradient: 'from-amber-500 to-amber-600', lineColor: '#f59e0b' },
  reviews: { icon: Star, gradient: 'from-yellow-500 to-yellow-600', lineColor: '#eab308' },
  default: { icon: TrendingUp, gradient: 'from-slate-500 to-slate-600', lineColor: '#64748b' },
};

export const DASHBOARD_OVERVIEW_SERIES: { key: DashboardGraphMetricKey; color: string }[] = [
  { key: 'members', color: '#0d9488' },
  { key: 'orders', color: '#a855f7' },
  { key: 'sales', color: '#f97316' },
  { key: 'payments', color: '#10b981' },
];

export const CUSTOMER_ACTIVITY_BADGE: Record<CustomerActivityStatus, string> = {
  [CustomerActivityStatus.ACTIVE]: 'bg-emerald-100 text-emerald-600 rounded-sm',
  [CustomerActivityStatus.NEW]: 'bg-blue-100 text-blue-600 rounded-sm',
  [CustomerActivityStatus.INACTIVE]: 'bg-gray-100 text-gray-600 rounded-sm',
  [CustomerActivityStatus.DORMANT]: 'bg-amber-100 text-amber-600 rounded-sm',
};

export const DASHBOARD_NOTIFICATIONS: {
  key: keyof DashboardNotificationsHotRESP;
  icon: LucideIcon;
  iconColor: string;
  countColor: string;
}[] = [
  {
    key: 'inquiries_in_progress',
    icon: MessageSquare,
    iconColor: 'text-pink-500',
    countColor: 'bg-pink-100 text-pink-600',
  },
  {
    key: 'product_out_stock_total',
    icon: AlertCircle,
    iconColor: 'text-orange-500',
    countColor: 'bg-orange-100 text-orange-600',
  },
  {
    key: 'product_near_out_stock_total',
    icon: Bell,
    iconColor: 'text-blue-500',
    countColor: 'bg-blue-100 text-blue-600',
  },
];

export const MEMBER_TREND_COLORS = {
  new: '#f97316',
  active: '#10b981',
  withdrawn: '#ef4444',
};

export const PAYMENT_STATUS_COLORS = {
  total: '#6366f1',
  successful: '#10b981',
};

export const PAYMENT_STAT_PERIOD_VALUES = [PaymentStatPeriod.MONTHLY, PaymentStatPeriod.QUARTERLY, PaymentStatPeriod.YEARLY];

/** Top-N products requested for the product statistics tab. */
export const PRODUCT_TOP_N = 10;
