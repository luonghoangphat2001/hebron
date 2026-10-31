import type { ProductVisibleRole } from '@/utils/enums/product.enum';
import type { Pagination } from '@/utils/types/response.type';
import type { ProductOptionGroups } from '../option-group/option-group.response';
import type { ProductBulkUpdateREQ } from './product.request';

export type LocalizedText = {
  ko: string;
  en: string;
};

export type ProductCategory = {
  id: number;
  name: LocalizedText;
  slug: string;
  parent_id: number | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductSpecification = {
  size: string | null;
  materials: string | null;
  case: string | null;
  product_period: string | null;
  total_product_amount: string | null;
  shipping_info: string | null;
  weight: string | null;
  notes: string | null;
};

/** File metadata returned by product detail for its downloadable design draft. */
export type ProductAiFileRESP = {
  id: number | null;
  name: string | null;
  path: string | null;
  url: string | null;
  type: string | null;
  mime_type: string | null;
  size: number | null;
  created_by: unknown | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Product = {
  id: number;
  category_ids: number[];
  name: LocalizedText;
  slug: string;
  template_ids?: number[] | null;
  description?: string | null;
  short_description: string | null;
  supply_price: number;
  brand_site_price: number;
  plain_site_price: number;
  selling_price: number;
  shipping_fee: number;
  price_content: string;
  sku: string;
  images: string[];
  file_ai: ProductAiFileRESP[];
  first_image: string | null;
  is_popular: boolean;
  is_featured: boolean;
  is_top_product: boolean;
  stock_quantity: number;
  min_quantity: number;
  max_quantity: number;
  stock_inventory_enabled?: boolean;
  has_option: boolean;
  sort_order: number;
  visible_roles: ProductVisibleRole[] | null;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categories: ProductCategory[];
  specification: ProductSpecification;
  option_groups: ProductOptionGroups[];
  has_discount: boolean;
  discount_percentage: number;
  average_rating: number | null;
  total_reviews: number | null;
  is_public: boolean;
  mes_inventory_enabled: boolean;
};

export type ProductListRESP = {
  products: Product[];
  pagination?: Pagination;
};

export type ProductDetailRESP = {
  product: Product;
};

export type ProductCategoryOption = {
  value: number;
  label: string;
  slug: string;
  code: string | null;
};

export type ProductSearchFiltersRESP = {
  filters: {
    category_options: ProductCategoryOption[];
  };
};

export type ProductUploadImagesRESP = {
  product_images: string[];
};

export type ProductCopyPreviewRESP = {
  product_id: number;
  title: string;
  default_copy_title: string;
};

export type ProductBulkStatusRESP = {
  updated_count: number;
  total_requested: number;
};

export type ProductBulkUpdateRESP = {
  updated_count: number;
  total_count: number;
  updated_fields: (keyof Omit<ProductBulkUpdateREQ, 'product_ids'>)[];
  category_count: number;
};

export type ProductBulkDeleteRESP = {
  deleted_count: number;
  total_requested: number;
};
