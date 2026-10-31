import type { DesignGroup } from '@/data/design/design.response';
import type { OrderDesignContentRESP, OrderItemConfigurationRESP } from '@/data/orders/orders.response';
import type { ProductSelectedOption, ProductSpecification } from '@/data/products/products.response';
import type { Icon, IconWeight } from '@phosphor-icons/react';

export type MyPageNavItem = {
  key: string;
  label: string;
  href: string;
};

export type MyPageNavGroup = {
  key: string;
  title?: string;
  items: MyPageNavItem[];
};

export type StatusOverviewItem = {
  key: string;
  label: string;
  count: number;
  icon: Icon;
  iconWeight?: IconWeight;
  href?: string;
};

export type StatusOverviewGroup = {
  key: string;
  title: string;
  items: StatusOverviewItem[];
};

export type RecentOrder = {
  id: string;
  orderDateTime: string;
  productName: string;
  productCode: string;
  productSpecs: string;
  productSpecification?: ProductSpecification | null;
  productStockQuantity?: number;
  selectedOptionValues?: ProductSelectedOption[];
  thumbnail: string;
  quantity: string;
  amount: number;
  status: string;
};

export type MyPageCustomerCenterItem = {
  label: string;
  value: string;
};

export type OrderDetailProduct = {
  id: string;
  name: string;
  thumbnail: string;
  quantity: number;
  price: number;
  configuration: OrderItemConfigurationRESP | null;
  order_design_content: OrderDesignContentRESP | null;
  design_group: DesignGroup | null;
};

export type OrderDetail = {
  id: string;
  orderCode: string;
  currentProductionStepKey: string;
  orderer: {
    name: string;
    phone: string;
  };
  customerManager: {
    name: string;
    assignedDate: string;
  };
  products: OrderDetailProduct[];
  shipping: {
    recipientName: string;
    recipientPhone: string;
    zipCode: string;
    address: string;
    method: string;
    carrier: string;
    fee: number;
    feeLabel: string;
    shippedDate: string;
    estimatedShippingDate?: string;
    trackingNumber: string;
  };
  payment: {
    method: string;
    status: string;
    paidAt: string;
    productAmount: number;
    shippingAmount: number;
    totalAmount: number;
    taxAmount: number;
  };
};

export type MembershipInfo = {
  userName: string;
  companyName: string;
  grade: string;
  gradeLabel: string;
  points: number;
  earnRate: number;
  upgradeProgress: number;
  upgradeTargetAmount: number;
  currentAmount: number;
};
