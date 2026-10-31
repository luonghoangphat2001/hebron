import type { Pagination } from '@/utils/types/response.type';

export type ProductOptions = {
  id: number | string;
  option_group_id: number | string;
  name: string;
  additional_price: number;
  additional_brand_site_price: number;
  additional_plain_site_price: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductOptionsListRESP = {
  product_options: ProductOptions[];
  pagination: Pagination;
};

export type ProductOptionsDetailRESP = {
  product_option: ProductOptions;
};
