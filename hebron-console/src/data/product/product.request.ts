import type { SortOrder } from '@/utils/enums/common.enum';
import type { ProductAvailability, ProductSort, ProductStatus, ProductVisibleRole } from '@/utils/enums/product.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ } from '@/utils/types/request.type';
import type { ProductSpecification } from './product.response';

export const PRODUCT_IMAGE_FIELD = 'images[]';

export type ProductListREQ = PaginationREQ & {
  product_name?: string;
  product_code?: string;
  status?: ProductStatus;
  category_id?: number;
  category_name?: string;
  search_term?: string;
  order_by?: ProductSort;
  sort_order?: SortOrder;
  is_public?: boolean;
  availability?: ProductAvailability;
};

export type ProductCreateREQ = {
  category_ids: number[];
  name: string;
  name_en?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  selling_price: number;
  brand_site_price?: number;
  plain_site_price?: number;
  shipping_fee?: number;
  price_content?: string;
  supply_price?: number;
  sku: string;
  images?: string[];
  /** Backend stores this as an array; the admin UI permits one file only. */
  file_ai?: string[] | null;
  is_active?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  is_top_product?: boolean;
  stock_quantity?: number;
  min_quantity?: number;
  max_quantity?: number;
  stock_inventory_enabled?: boolean;
  // sort_order?: number;
  visible_roles?: ProductVisibleRole[];
  specification?: ProductSpecification;
  has_option?: boolean;
  option_group_ids?: number[];
  template_ids?: number[];
};

/** sku/slug must be omitted when unchanged (backend uniqueness check) — build with `buildProductUpdateREQ`. */
export type ProductUpdateREQ = Partial<ProductCreateREQ> & {
  id: number;
  first_image?: string;
};

export type ProductExportExcelREQ = Omit<ProductListREQ, 'page'> & ExportExcelBaseREQ;

export type ProductCopyREQ = {
  id: number;
  copy_title: string;
};

export type ProductBulkStatusField = 'is_active' | 'is_popular' | 'is_featured';

export type ProductBulkStatusREQ = {
  product_ids: number[];
  field: ProductBulkStatusField;
  value: boolean;
};

export type ProductBulkUpdateREQ = {
  product_ids: number[];
  category_ids?: number[];
  selling_price?: number;
  stock_quantity?: number;
  sort_order?: number;
};

export type ProductBulkDeleteREQ = {
  product_ids: number[];
};

export type ProductMesSettingsREQ = {
  id: number;
  mes_inventory_enabled: boolean;
};
