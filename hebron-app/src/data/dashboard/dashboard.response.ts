import type { DashboardBucketKey, DeliveryBucket, DesignBucket, ProductionBucket } from '@/utils/enums/dashboard.enum';
import type { InquiryCategory } from '@/utils/enums/inquiry.enum';
import type { OrderStatus } from '@/utils/enums/order.enum';
import type { MyPageOrderHistoryListItemRESP } from '../orders/mypage-orders.response';

export type DashboardMemberSummaryRESP = {
  name: string;
  membership_tier: string | null;
  accumulation_rate: number;
  point_balance: number;
  exclusive_account: string | null;
  current_quarter_spent: number;
  next_tier: string | null;
};

export type DashboardStatusItemRESP = {
  key: DashboardBucketKey;
  label: string;
  count: number;
};

export type DashboardProductionStatusItemRESP = DashboardStatusItemRESP & {
  key: ProductionBucket | string;
};

export type DashboardDesignStatusItemRESP = DashboardStatusItemRESP & {
  key: DesignBucket | string;
};

export type DashboardDeliveryStatusItemRESP = DashboardStatusItemRESP & {
  key: DeliveryBucket | string;
};

/** Slim recent-order row from mypage dashboard (not full `OrderRESP`). */
export type DashboardRecentOrderRESP = {
  order_number: string;
  product_name: string;
  order_date: string;
  estimated_production_days: number;
  /** Formatted amount, e.g. `"908,250"`. */
  payment_amount: string;
  /** Display string, e.g. `"750원"`. */
  shipping_fee: string;
  status: string;
  status_value: OrderStatus | string;
};

export type DashboardInquirySummaryItemRESP = {
  category: InquiryCategory | string;
  label: string;
  answered: number;
  pending: number;
  total: number;
};

export type DashboardReviewSummaryRESP = {
  reviewable_count: number;
  photo_review_points: number;
  normal_review_points: number;
};

export type DashboardRESP = {
  member_summary: DashboardMemberSummaryRESP;
  order_status?: DashboardStatusItemRESP[];
  customer_order_status?: DashboardStatusItemRESP[];
  production_status: DashboardProductionStatusItemRESP[];
  design_status: DashboardDesignStatusItemRESP[];
  delivery_status: DashboardDeliveryStatusItemRESP[];
  recent_orders: MyPageOrderHistoryListItemRESP[];
  inquiry_summary: DashboardInquirySummaryItemRESP[];
  review_summary: DashboardReviewSummaryRESP;
};
