import type {
  OrderItemConfigurationRESP,
  OrderLineItemRESP,
  OrderProofRESP,
  OrderRESP,
  OrderShippingRESP,
} from '@/data/orders/orders.response';
import type { OrderStatus } from '@/utils/enums/order.enum';

export type MyPageOrderHistoryListItemRESP = {
  order_number: string;
  ordered_at: string;
  thumbnail_url: string | null;
  product_name: string;
  product_spec: OrderItemConfigurationRESP;
  quantity: number;
  amount: string;
  status: OrderStatus | string;
  status_label: string;
  customer_status?: string | null;
  proof_status: string | null;
  invoice_number: string | null;
  can_track_delivery: boolean;
};

export type MyPageOrderHistoryListRESP = {
  orders: MyPageOrderHistoryListItemRESP[];
};

export type MyPageTrackingStepRESP = {
  key: string;
  label: string;
  state: 'completed' | 'current' | 'upcoming' | string;
};

export type MyPageTrackingGroupRESP = {
  visible: boolean;
  steps: MyPageTrackingStepRESP[];
};

export type MyPageOrderDetailSectionsRESP = {
  orderer_info: {
    order_number: string;
    order_date: string;
    orderer_name: string;
    orderer_phone: string;
    orderer_address: string | null;
    customer_manager: string | null;
  };
  tracking: {
    display_mode: string;
    design_required: boolean;
    design_mode_code: string | null;
    groups: {
      production: MyPageTrackingGroupRESP;
      design: MyPageTrackingGroupRESP;
      delivery: MyPageTrackingGroupRESP;
    };
  };
  product_infos: Array<{
    raw: OrderLineItemRESP;
    product_name: string;
    quantity: number;
    quantity_label: string;
    total_amount: number;
  }>;
  proof_confirmation: OrderProofRESP & {
    documents: Array<{
      sequence: number;
      product_name: string;
      upload_file_url: string | null;
      preview_images: string[];
    }>;
  };
  shipping_info: OrderShippingRESP;
  order_shipments: unknown[];
  shipping_address_change: {
    history_available: boolean;
    version_count: number;
  };
  payment_info: {
    payment_method: string;
    payment_status: string;
    totals: OrderRESP['totals'];
    payment_details: OrderRESP['payment_details'];
    shipping_fee_breakdown: unknown[];
  };
};

export type MyPageOrderHistoryDetailRESP = {
  order: OrderRESP & { order_shipments?: unknown[] };
  sections: MyPageOrderDetailSectionsRESP;
};
