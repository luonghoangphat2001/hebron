import type { CategoryLevels, CategoryStatus } from '@/utils/enums/category.enum';
import type { ExportStatus } from '@/utils/enums/common.enum';
import type { PaginationRESP } from '@/utils/types/response.type';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import type { LocalizedText } from '../product/product.response';

export type ParentCategoryRESP = {
  id: number | string;
  name: string;
};

export type CategoryStatusRESP = {
  value: CategoryStatus;
  label: string;
};

export type CategoryRegistrant = {
  id: number | string;
  username: string;
  name: string;
};

export type CategorynNode = {
  id: number;
  name: string;
  name_en: string | null;
  slug: string;
  parent_id: number | null;
  parent?: ParentCategoryRESP;
  description?: string;
  subtitle: string | null;
  image?: string;
  icon?: string;
  banner_image?: string;
  sort_order: number;
  exposure_order: number;
  is_best: boolean;
  level: CategoryLevels;
  status: CategoryStatusRESP;
  exposure_start_date?: string;
  exposure_end_date?: string;
  registrant: CategoryRegistrant;
  created_at: number;
  updated_at: number;
  children: CategorynNode[] | [];
};

export type CategoryRESP = CategorynNode;

export type CategoryExportHistory = {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string;
  status: ExportStatus;
  filters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CateGoryListRESP = {
  categories: CategorynNode[];
};

export type CateGoryDetailRESP = {
  category: CategorynNode;
};

export type CategoryListSnapshot = [QueryKey, PaginationRESP<CateGoryListRESP> | undefined][];

export type CategoryProduct = {
  id: number;
  images: string[];
  name: LocalizedText;
  sku: string;
  selling_price: number;
  stock_quantity: number;
  position: number;
  is_public: boolean;
  is_top_product: boolean;
  mes_inventory_enabled: boolean;
  created_at: string;
};

export type CategoryProductListRESP = {
  products: CategoryProduct[];
};

export type CategoryProductPages = InfiniteData<PaginationRESP<CategoryProductListRESP>, number>;
