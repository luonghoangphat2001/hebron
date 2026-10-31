import type { DesignRevisionStatus } from '@/utils/enums/common.enum';
import type { OrderStatus, OrderStatusStage, PaymentMethod, PaymentStatus, ShippingMethod } from '@/utils/enums/order.enum';
import type { Pagination } from '@/utils/types/response.type';

export type OrderPrintPdfFileRESP = {
  order_item_id: number;
  design_group_id: number;
  filename: string;
  download_url: string;
};

export type OrderPrintPdfManifestRESP = {
  order_number: string;
  files: OrderPrintPdfFileRESP[];
};

export type OrderUserRESP = {
  id: number;
  username: string;
  name?: string;
  email?: string;
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
  phone?: string;
  phone2?: string;
  email?: string;
  company_name?: string;
};

export type OrderShippingRESP = {
  name?: string;
  phone?: string;
  postcode?: string;
  address?: string;
  address_detail?: string;
  method?: ShippingMethod | string;
  shipping_carrier?: string;
  shipped_date?: string;
  shipping_memo?: string;
  shipping_status?: string;
  shipping_status_label_ko?: string;
  shipping_status_label_en?: string;
  invoice_number?: string;
};

export type OrderPaymentDetailsRESP = {
  order_amount: string;
  shipping_fee: string;
  payment_amount: string;
  paid_amount: string;
  transaction_id?: string;
};

export type OrderProofRESP = {
  status?: string | null;
  confirmed_at?: string | null;
  corrections?: any[];
  file_resubmissions?: any[];
};

export type OrderMetadataRESP = {
  selected_options?: any;
  selected_option_values?: any;
  estimated_production_days?: number;
  placed_at?: string;
  customer_note?: string | null;
};

export type OrderItemProductSnapshotRESP = {
  id: number;
  sku?: string;
  name: string;
  slug?: string;
  images?: string[];
  name_en?: string;
  is_active?: boolean;
  created_at?: string;
  deleted_at?: string;
  has_option?: number;
  is_popular?: boolean;
  sort_order?: number;
  updated_at?: string;
  view_count?: number;
  description?: string;
  is_featured?: boolean;
  option_type?: string;
  max_quantity?: number;
  min_quantity?: number;
  shipping_fee?: number;
  supply_price?: number;
  total_rating?: number;
  selling_price?: number;
  total_reviews?: number;
  visible_roles?: string[];
  average_rating?: number;
  exposure_count?: number;
  stock_quantity?: number;
  brand_site_price?: number;
  plain_site_price?: number;
  legacy_product_id?: number;
  short_description?: string;
  mobile_description?: string;
  legacy_product_code?: string;
  mes_inventory_enabled?: boolean;
  specification?: {
    id: number;
    case: string;
    size: string;
    notes: string | null;
    weight: string;
    materials: string;
    created_at: string;
    product_id: number;
    updated_at: string;
    shipping_info: string | null;
    product_period: string | null;
    total_product_amount: string;
  };
};

export type OrderItemSelectedOption = {
  group: {
    id: number;
    code: string;
    name: string;
  };
  option: {
    id: number;
    name: string;
    additional_price: number;
  };
};

export type OrderItemConfigurationRESP = {
  product_snapshot?: OrderItemProductSnapshotRESP;
  selected_options?: OrderItemSelectedOption[];
  selected_option_values: OrderItemSelectedOption[];
};

export type OrderDesignContentAttachmentRESP = {
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
};

export type OrderDesignContentRESP = {
  id: number;
  title: string;
  recipient_name: string;
  event_date: string;
  main_text: string;
  sender_name: string;
  attachment_file_urls: OrderDesignContentAttachmentRESP[];
  created_at: string;
  updated_at: string;
};

type DesignMataData = {
  schema: string;
  product_slug: string;
  // state: ProductDesignState;
  preview_front: string;
  preview_back?: string;
};

export type DesignGroup = {
  id: number;
  user_id?: number | null;
  product_id: number | null;
  title: string;
  size_option_id?: number;
  size_option_width?: number;
  size_option_height?: number;
  width_mm?: number;
  height_mm?: number;
  layout_data?: Record<string, unknown> | null;
  preview_image_path: string | null;
  preview_pdf_url?: string | null;
  design_revision: string;
  print_pdf: {
    available: boolean;
    revision: string | null;
  };
  metadata?: DesignMataData;
  created_at?: string;
  updated_at?: string;
};

export type OrderItemRESP = {
  id: number;
  product_id?: number;
  title?: string;
  quantity?: number;
  supply_price?: number;
  selling_price?: number;
  option_price?: number;
  sub_total_amount?: number;
  tax_amount?: number;
  total_amount?: number | string;
  configuration?: OrderItemConfigurationRESP;
  notes?: string;
  order_design_content?: OrderDesignContentRESP | null;
  design_group: DesignGroup | null;
};

export type OrderManagerRESP = {
  id: number;
  name: string;
};

export type OrderWaybillRESP = {
  number: string;
  courier: string;
  registered_at: string;
};

export type OrderDesignRevisionFileRESP = {
  name: string;
  size: number;
  url: string;
};

export type OrderDesignRevisionRESP = {
  slug: string;
  status: DesignRevisionStatus;
  comments: string[];
  created_at: string;
  files: OrderDesignRevisionFileRESP[];
};

export type OrderProductInformationItemRESP = {
  id: number;
  title?: string;
  quantity?: number;
  multiplier?: number | null;
  unit?: string | null;
  production_days?: number | null;
  unit_price?: string | number;
  total_amount?: string | number;
  options?: OrderItemConfigurationRESP;
  configuration?: OrderItemConfigurationRESP;
  notes?: string | null;
  post_processing?: unknown;
  designs?: unknown[];
  design_group?: DesignGroup | null;
  order_design_content?: OrderDesignContentRESP | null;
};

export type OrderProductInformationRESP = {
  items?: OrderProductInformationItemRESP[];
};

export type OrderListItemRESP = {
  id: number;
  order_number: string;
  user?: OrderUserRESP;
  company_name?: string;
  recipient_name?: string;
  recipient_phone?: string;
  status: OrderStatus | string;
  status_label_ko?: string;
  status_label_en?: string;
  order_status_stage?: OrderStatusStage | string;
  payment_method?: PaymentMethod | string;
  payment_status?: PaymentStatus | string;
  total_amount: string | number;
  currency?: string;
  item_count: number;
  first_item_title?: string;
  has_design?: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderDetailRESP = {
  id: number;
  user?: OrderUserRESP;
  order_number: string;
  payment_method?: PaymentMethod | string;
  status: OrderStatus | string;
  status_label_ko?: string;
  status_label_en?: string;
  payment_status?: PaymentStatus | string;
  transaction_id?: string;
  order_status_stage?: OrderStatusStage | string;
  estimated_production_days?: number;
  shipping_fee?: string;
  shipping_branch_name?: string;
  shipping_time?: string;
  amount_shipping?: string;
  shipping_method?: ShippingMethod | string;
  currency?: string;
  totals?: OrderTotalsRESP;
  contact?: OrderContactRESP;
  shipping?: OrderShippingRESP;
  payment_details?: OrderPaymentDetailsRESP;
  proof?: OrderProofRESP;
  metadata?: OrderMetadataRESP;
  items?: OrderItemRESP[];
  created_at: string;
  updated_at: string;
  company_name?: string;
  quantity?: number;
  item_count: number;
  has_design?: boolean;
  reception_manager?: OrderManagerRESP;
  production_manager?: OrderManagerRESP;
  production_site?: string;
  requested_delivery_date?: string;
  waybill?: OrderWaybillRESP;
  order_source?: string;
  order_linkage?: string;
  reception_point?: string;
  deleted_at?: string;
  product_information?: OrderProductInformationRESP;
  last_design_revision?: OrderDesignRevisionRESP | null;
};

export type OrderDetailDataRESP = {
  order: OrderDetailRESP;
};

export type OrderDataRESP = {
  orders: OrderListItemRESP[];
  pagination: Pagination;
};

export type OrderStatusHistoryUserRESP = {
  id: number;
  name: string;
  email?: string;
  username?: string;
};

export type OrderStatusHistoryItemRESP = {
  id: number;
  changed_at: string;
  old_status?: string;
  new_status: string;
  changed_by?: OrderStatusHistoryUserRESP;
  reason?: string;
  notes?: string;
};

export type OrderStatusHistoryDataRESP = {
  history: OrderStatusHistoryItemRESP[];
};

export type OrderDesignFileItemRESP = {
  design_group_id: number;
  design_title: string;
  revised_file_name: string;
  revised_file_url: string;
  rejection_reason?: string | null;
  confirmation_requested_at: string;
  confirmed_at?: string | null;
  rejected_at?: string | null;
};

export type OrderDesignFilesDataRESP = {
  order_number: string;
  status: string;
  design_files: OrderDesignFileItemRESP[];
};

export type UploadOrderDraftDesignFileItemRESP = OrderDesignFileItemRESP;

export type UploadOrderDraftFileDataRESP = OrderDesignFilesDataRESP;

export type WorkInstructionPrintRESP = {
  pdf_url: string;
};
