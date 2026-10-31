import { Product1 } from '@/assets/images';
import { CUSTOMER_ORDER_STEPS } from '@/data/orders/customer-order-status';
import type { DashboardRecentOrderRESP, DashboardRESP } from '@/data/dashboard/dashboard.response';
import { DashboardGroup, OrderBucket } from '@/utils/enums/dashboard.enum';
import type { MembershipInfo, RecentOrder, StatusOverviewGroup } from '@/utils/types/my-page.type';
import { GiftIcon, MoneyIcon, PackageIcon, ShoppingBagIcon, TruckIcon, type Icon } from '@phosphor-icons/react';

const ORDER_STATUS_ITEMS: { key: OrderBucket; label: string; icon: Icon }[] = [
  { key: OrderBucket.ORDER_RECEIVED, label: '주문접수', icon: ShoppingBagIcon },
  { key: OrderBucket.PAYMENT_COMPLETED, label: '결제완료', icon: MoneyIcon },
  { key: OrderBucket.PREPARING_PRODUCT, label: '상품준비중', icon: PackageIcon },
  { key: OrderBucket.SHIPPING, label: '배송중', icon: TruckIcon },
  { key: OrderBucket.DELIVERY_COMPLETED, label: '배송완료', icon: GiftIcon },
];

export const mapDashboardStatusToOverviewGroup = (dashboard?: DashboardRESP): StatusOverviewGroup => {
  if (dashboard?.customer_order_status) {
    const counts = new Map(dashboard.customer_order_status.map((item) => [item.key, item.count]));
    const steps = [
      ...CUSTOMER_ORDER_STEPS.slice(0, 2),
      { key: 'design_revision_requested', label: '시안 수정요청' },
      ...CUSTOMER_ORDER_STEPS.slice(2),
    ];
    return {
      key: DashboardGroup.ORDER,
      title: '최근 주문 내역',
      items: steps.map((step) => ({ ...step, count: counts.get(step.key) ?? 0, icon: PackageIcon, iconWeight: 'thin' })),
    };
  }
  const counts = new Map((dashboard?.order_status ?? []).map((item) => [item.key, item.count]));

  return {
    key: DashboardGroup.ORDER,
    title: '최근 주문 내역',
    items: ORDER_STATUS_ITEMS.map((item) => ({
      ...item,
      // The backend currently omits order_received; keep its placeholder at zero.
      count: counts.get(item.key) ?? 0,
      iconWeight: 'thin',
    })),
  };
};

const parseFormattedAmount = (value?: string) => (value ? Number(value.replace(/,/g, '')) || 0 : 0);

export const mapDashboardRecentOrderToRecentOrder = (order: DashboardRecentOrderRESP): RecentOrder => ({
  id: order.order_number,
  orderDateTime: order.order_date,
  productName: order.product_name,
  productCode: order.order_number,
  productSpecs: '-',
  thumbnail: Product1,
  quantity: '-',
  amount: parseFormattedAmount(order.payment_amount),
  status: order.status,
});

export const mapDashboardRecentOrders = (orders: DashboardRecentOrderRESP[]) => orders.map(mapDashboardRecentOrderToRecentOrder);

export const mapDashboardMemberSummaryToMembershipInfo = (summary: DashboardRESP['member_summary']): MembershipInfo => ({
  userName: summary.name,
  companyName: summary.exclusive_account ?? summary.membership_tier ?? '',
  grade: summary.membership_tier ?? '',
  gradeLabel: summary.membership_tier ?? '',
  points: summary.point_balance,
  earnRate: summary.accumulation_rate,
  upgradeProgress: 0,
  upgradeTargetAmount: 0,
  currentAmount: summary.current_quarter_spent,
});
