import type { InquiryAssignedUserRESP } from '@/data/inquiry/inquiry.response';
import type { CustomerActivityStatus } from '@/utils/enums/dashboard.enum';

export type DashboardMetricUnit = 'amount' | 'count' | 'percent' | 'hours';

export type DashboardMetricRESP = {
  label: string;
  current: number;
  previous?: number;
  change?: number;
  unit: DashboardMetricUnit;
};

export type DashboardGraphPointRESP = {
  date: string;
  week?: number;
  total?: number;
  total_amount?: number | string;
};

export type DashboardGraphSeriesRESP = {
  /** An array, or a date-keyed object for some series. */
  data: DashboardGraphPointRESP[] | Record<string, DashboardGraphPointRESP>;
  total?: number;
  total_amount?: number | string;
};

export type DashboardGraphMetricKey = 'sales' | 'members' | 'orders' | 'payments' | 'reviews';

export type DashboardGraphBucketRESP = Partial<Record<DashboardGraphMetricKey, DashboardGraphSeriesRESP>>;

export type DashboardNotificationsHotRESP = {
  inquiries_in_progress: number;
  product_out_stock_total: number;
  product_near_out_stock_total: number;
};

export type DashboardOperationRESP = {
  metric: {
    sales: DashboardMetricRESP;
    members: DashboardMetricRESP;
    orders: DashboardMetricRESP;
    payments: {
      success: DashboardMetricRESP;
      outstanding: DashboardMetricRESP;
      rate: DashboardMetricRESP;
    };
    reviews: DashboardMetricRESP;
  };
  notifications_hot: DashboardNotificationsHotRESP;
  graph_data: {
    daily?: DashboardGraphBucketRESP;
    weekly?: DashboardGraphBucketRESP;
  };
};

export type DashboardStatValueRESP = {
  value: number;
  label: string;
  unit: DashboardMetricUnit;
};

export type DashboardStatRatioRESP = DashboardStatValueRESP & {
  percentage: number;
};

export type CustomerStaticDetailRESP = {
  customer_id: number;
  customer_name: string;
  status: CustomerActivityStatus;
  orders: number;
  cumulative_sales: number;
  aov: number;
  sales_rep: string | null;
  last_order: string | null;
};

export type DashboardCustomerStaticRESP = {
  summary: {
    total_customers: DashboardStatValueRESP;
    new_customers: DashboardStatValueRESP;
    active_rate: DashboardStatValueRESP;
    avg_ltv: DashboardStatValueRESP;
  };
  customer_activity_status: Record<CustomerActivityStatus, DashboardStatRatioRESP>;
  customer_details: CustomerStaticDetailRESP[];
};

export type MemberStaticPointRESP = {
  user_id: number;
  user_name: string;
  date: string;
  count: number;
  unit: DashboardMetricUnit;
};

export type MemberStaticLevelRESP = {
  user_id: number;
  user_name: string;
  level: number | null;
  count: number;
  unit: DashboardMetricUnit;
};

export type MemberStaticPathRESP = {
  user_id: number;
  user_name: string;
  path: string;
  count: number;
  unit: DashboardMetricUnit;
};

export type MemberStaticTotalRESP = {
  total: number;
  unit: DashboardMetricUnit;
};

export type DashboardMemberStaticRESP = {
  new_members: MemberStaticPointRESP[];
  withdrawn_members: MemberStaticPointRESP[];
  active_members: MemberStaticPointRESP[];
  members_by_level: MemberStaticLevelRESP[];
  members_by_path: MemberStaticPathRESP[];
  summary: {
    total_new_members: MemberStaticTotalRESP;
    total_withdrawn_members: MemberStaticTotalRESP;
    total_active_members: MemberStaticTotalRESP;
    total_members: MemberStaticTotalRESP;
    avg_new_members_per_day: MemberStaticTotalRESP;
    avg_withdrawn_members_per_day: MemberStaticTotalRESP;
    avg_active_members_per_day: MemberStaticTotalRESP;
    net_growth: MemberStaticTotalRESP;
  };
};

export type OrderStaticSummaryItemRESP = {
  total: number;
  total_amount: number | string;
  change?: number;
  unit: DashboardMetricUnit;
};

export type OrderStaticSalesItemRESP = {
  id: number;
  name: string;
  total_quantity: number | string;
  total_amount: number;
};

export type OrderStaticChartPointRESP = {
  date: string;
  week?: number;
  total: number;
  total_amount: number | string;
};

export type OrderStaticChartBucketRESP = {
  data: OrderStaticChartPointRESP[];
  total_amount?: number | string;
};

export type DashboardOrderStaticRESP = {
  summary: {
    orders: OrderStaticSummaryItemRESP;
    sales: OrderStaticSummaryItemRESP;
    cancellations_returns: OrderStaticSummaryItemRESP;
  };
  sales_analytics: {
    product: OrderStaticSalesItemRESP[];
    category: OrderStaticSalesItemRESP[];
    users: OrderStaticSalesItemRESP[];
  };
  ratios_order_status: Record<string, number>;
  chart: {
    daily?: OrderStaticChartBucketRESP;
    weekly?: OrderStaticChartBucketRESP;
  };
};

export type PaymentMethodStatRESP = {
  payment_method: string;
  payment_method_label?: string;
  total_count: number;
  successful_count: number;
  failed_count: number;
  refunded_count: number;
  successful_amount: number;
  failed_amount: number;
  refunded_amount: number;
  total_amount: number;
  unit: DashboardMetricUnit;
  successful_percentage: number;
  failed_percentage: number;
  refunded_percentage: number;
  amount_percentage: number;
};

export type PaymentStatusStatRESP = {
  count: number;
  amount: number;
  percentage_count: number;
  percentage_amount: number;
};

export type PaymentPeriodBreakdownRESP = {
  period: string;
  total_count: number;
  total_amount: number;
  successful_count: number;
  failed_count: number;
};

export type DashboardPaymentStaticRESP = {
  start_date: string;
  end_date: string;
  sales_statistics: Record<string, PaymentMethodStatRESP>;
  payment_status_statistics: Record<'successful' | 'failed' | 'refunded', PaymentStatusStatRESP>;
  period_breakdown: PaymentPeriodBreakdownRESP[];
};

export type ProductStaticItemRESP = {
  product_id: number;
  name: string;
  name_en: string | null;
  name_ja: string | null;
  is_active: number;
  total_quantity: number;
  total_revenue: number;
  unit: DashboardMetricUnit;
  rank?: number;
};

export type ProductStaticCtrRESP = {
  product_id: number;
  name: string;
  name_en: string | null;
  name_ja: string | null;
  is_active: number;
  view_count: number;
  exposure_count: number;
  click_count: number;
  ctr: number;
  unit: DashboardMetricUnit;
};

export type DashboardProductStaticRESP = {
  sales_volume: ProductStaticItemRESP[];
  top_n_products: ProductStaticItemRESP[];
  promoted_products_ctr: ProductStaticCtrRESP[];
};

export type InquirySummaryItemRESP = {
  value: number;
  label: string;
  unit: DashboardMetricUnit;
  description?: string;
};

export type InquiryTypeStatRESP = {
  type: string;
  label: string;
  count: number;
};

export type InquiryStatusStatRESP = {
  status: string;
  label: string;
  count: number;
  percentage: number;
};

export type InquiryPersonStatRESP = {
  person_in_charge?: InquiryAssignedUserRESP | string | null;
  cases_processed: number;
  avg_processing_time?: number;
};

export type DashboardInquiryStaticRESP = {
  summary: {
    total_inquiries: InquirySummaryItemRESP;
    resolution_rate: InquirySummaryItemRESP;
    avg_processing_time: InquirySummaryItemRESP;
    unassigned: InquirySummaryItemRESP;
  };
  total_inquiries: number;
  by_inquiry_type: InquiryTypeStatRESP[];
  by_processing_status: InquiryStatusStatRESP[];
  by_person_in_charge: InquiryPersonStatRESP[];
};
