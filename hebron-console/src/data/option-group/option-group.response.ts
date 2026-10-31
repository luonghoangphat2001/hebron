import type { Pagination } from '@/utils/types/response.type';
import type { ProductOptions } from '../option/option.response';

export type ProductOptionGroups = {
  id: number | string;
  code: string;
  name: string;
  display_type: string;
  is_required: boolean;
  products_count: number;
  options: ProductOptions[];
  created_at: string;
  updated_at: string;
};

export type ProductItems = {
  id: number | string;
  name: string;
  slug: string;
};

export type ProductOptionGroupsDetail = ProductOptionGroups & {
  products: ProductItems[];
};

export type ProductOptionGroupsListRESP = {
  product_option_groups: ProductOptionGroups[];
  pagination: Pagination;
};

export type ProductOptionGroupsDetailRESP = {
  product_option_group: ProductOptionGroupsDetail;
};
