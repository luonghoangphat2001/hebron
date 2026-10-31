import type { OrderSelectedOptionREQ } from '@/data/orders/orders.request';
import type { UserAuthority, UserStatus } from '@/utils/enums/common.enum';
import type {
  OrderPaymentMethod,
  OrderShippingMethod,
  OrderStatus,
  OrderStatusStage,
  PaymentStatus,
} from '@/utils/enums/order.enum';
import type { DesignGroup } from '../design/design.response';
import type { FileAttachmentREQ } from '../files/files.request';
import type { ProductSelectedOption, ProductSpecification } from '../products/products.response';

export type OrderUserRESP = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  status: UserStatus | string;
  authority: UserAuthority | string;
  postcode: string;
  address: string;
  detailed_address: string | null;
  agree_privacy: boolean;
  agree_terms: boolean;
  agreed_at: string;
  email_verified_at: string | null;
  last_login_at: string;
  last_login_ip: string;
  created_at: string;
  updated_at: string;
};

export type OrderTotalsRESP = {
  subtotal: string;
  discount: string;
  tax: string;
  shipping_fee: string;
  total: string;
};

export type OrderContactRESP = {
  name: string;
  phone: string;
  phone2: string | null;
  email: string;
  company_name: string | null;
};

export type OrderShippingRESP = {
  name: string;
  phone: string;
  postcode: string;
  address: string;
  address_detail: string | null;
  method: OrderShippingMethod | string;
  shipping_carrier: string | null;
  shipped_date: string | null;
  estimated_shipping_date?: string | null;
  tracking_number?: string | null;
  shipping_memo: string | null;
  shipping_status: string | null;
  shipping_status_label_ko: string | null;
  shipping_status_label_en: string | null;
  invoice_number: string | null;
};

export type OrderPaymentDetailsRESP = {
  order_amount: string;
  shipping_fee: string;
  payment_amount: string;
  paid_amount: string;
};

export type OrderProofRESP = {
  status: string | null;
  confirmed_at: string | null;
  corrections: unknown[];
  file_resubmissions: unknown[];
};

export type OrderMetadataRESP = {
  selected_options: OrderSelectedOptionREQ[] | null;
  selected_option_values: unknown[] | null;
  estimated_production_days: number;
  placed_at: string;
  customer_note: string | null;
};

export type OrderProductSnapshotRESP = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  images: string[];
  name_en: string | null;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
  has_option: number;
  is_popular: boolean;
  sort_order: number;
  updated_at: string;
  view_count: number;
  description: string | null;
  is_featured: boolean;
  option_type: string | null;
  max_quantity: number;
  min_quantity: number;
  shipping_fee: number;
  supply_price: number;
  total_rating: number;
  selling_price: number;
  total_reviews: number;
  visible_roles: string[];
  average_rating: number;
  exposure_count: number;
  stock_quantity: number;
  brand_site_price: number;
  plain_site_price: number;
  legacy_product_id: number | null;
  short_description: string | null;
  mobile_description: string | null;
  legacy_product_code: string | null;
  specification?: ProductSpecification | null;
};

export type OrderItemConfigurationRESP = {
  product_snapshot: OrderProductSnapshotRESP;
  selected_options: OrderSelectedOptionREQ[];
  selected_option_values: ProductSelectedOption[];
};

export type OrderDesignContentRESP = {
  id: number;
  title: string;
  recipient_name: string;
  event_date: string;
  main_text: string;
  sender_name: string;
  attachment_file_urls: FileAttachmentREQ[];
  created_at: string;
  updated_at: string;
};

export type OrderLineItemRESP = {
  id: number;
  product_id: number;
  title: string;
  quantity: number;
  supply_price: number;
  selling_price: number;
  option_price: number;
  sub_total_amount: number;
  tax_amount: number;
  total_amount: number;
  configuration: OrderItemConfigurationRESP;
  notes: string | null;
  order_design_content: OrderDesignContentRESP | null;
  design_group: DesignGroup | null;
};

export type OrderRESP = {
  id: number;
  user: OrderUserRESP | null;
  order_number: string;
  payment_method: OrderPaymentMethod | string;
  status: OrderStatus | string;
  status_label_ko: string;
  status_label_en: string;
  customer_status?: string | null;
  customer_status_label?: string | null;
  payment_status: PaymentStatus;
  order_status_stage: OrderStatusStage | string;
  estimated_production_days: number;
  shipping_fee: string;
  shipping_branch_name: string | null;
  shipping_time: string | null;
  amount_shipping: string;
  shipping_method: OrderShippingMethod | string;
  currency: string;
  totals: OrderTotalsRESP;
  contact: OrderContactRESP;
  shipping: OrderShippingRESP;
  payment_details: OrderPaymentDetailsRESP;
  proof: OrderProofRESP;
  metadata: OrderMetadataRESP;
  items?: OrderLineItemRESP[];
  created_at: string;
  updated_at: string;
};

export type OrderListRESP = {
  orders: OrderRESP[];
};

export type OrderDetailRESP = {
  order: OrderRESP;
};

export type OrderInquiryDetailRESP = {
  order: OrderRESP;
};
