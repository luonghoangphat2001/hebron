import type { CategoryRESP, LocalizedNameRESP } from '@/data/categories/categories.response';
import type { SiteType } from '@/utils/enums/common.enum';
import type { FileAttachmentREQ } from '../files/files.request';

export type ProductAIFileRESP = {
  id: number;
  name: string;
  path: string;
  url: string;
  type: string;
  mime_type: string;
  size: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductItemRESP = {
  id: number;
  category_id: number | null;
  category_ids?: number[];
  name: LocalizedNameRESP;
  slug: string;
  link?: string;
  description?: string;
  short_description: string | null;
  supply_price?: number;
  brand_site_price?: number;
  plain_site_price?: number;
  selling_price?: number;
  shipping_fee?: number;
  sku?: string;
  images?: string[];
  first_image: string | null;
  file_ai?: ProductAIFileRESP[] | null;
  is_popular: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  has_discount: boolean | null;
  discount_percentage: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  view_count: number;
  stock_inventory_enabled?: boolean;
  stock_quantity: number;
  min_quantity: number;
  max_quantity: number;
  has_option: boolean;
  visible_roles: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories: CategoryRESP[];
  specification?: ProductSpecification;
  option_groups?: ProductOptionGroupRESP[];
  price_content?: string;
};

export type ProductOptionRESP = {
  id: number;
  name: string;
  additional_price: number;
  additional_brand_site_price: number;
  additional_plain_site_price: number;
  sort_order: number;
  metadata?: Record<string, unknown>;
};

export type ProductOptionGroupRESP = {
  id: number;
  code: string;
  name: string;
  display_type: string;
  is_required: boolean;
  sort_order: number;
  options: ProductOptionRESP[];
};

export type ProductSpecification = {
  size: string;
  materials: string;
  case: string;
  product_period: string | null;
  total_product_amount: string;
  shipping_info: string;
  weight: string;
  notes: string | null;
};

export type ProductSearchRESP = {
  keyword: string;
  products: ProductItemRESP[];
};

export type ProductSearchByCategoryRESP = {
  category: CategoryRESP;
  products: ProductItemRESP[];
};

export type ProductDetailRESP = {
  product: ProductItemRESP;
};

export type ProductSelectedOption = {
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

export type ProductQuoteRESP = {
  supply_price: number;
  selling_price: number;
  option_price: number;
  selected_options: ProductSelectedOption[];
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  quantity: number;
  shipping_fee: number;
  estimated_production_days: number;
  site_type: SiteType;
};

export type ProductDesignContent = {
  id: number;
  title: string;
  recipient_name: string;
  event_date: string;
  event_date_ko: string;
  main_text: string;
  sender_name: string;
  attachment_file_urls: FileAttachmentREQ[];
  created_at: string;
  updated_at: string;
};

export type ProductDesignContentRESP = {
  order_design_content: ProductDesignContent;
};
