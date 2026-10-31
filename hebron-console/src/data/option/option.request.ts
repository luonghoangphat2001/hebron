import type { PaginationREQ } from '@/utils/types/request.type';

export type OptionSortBy = 'sort order' | 'label' | 'value' | 'create at';

export type OptionListREQ = PaginationREQ & {
  option_group_id?: number | string;
  name?: string;
  is_active?: boolean;
  sort_by?: OptionSortBy;
};

export type OptionCreateREQ = {
  option_group_id: number | string;
  name: string;
  additional_price: number;
  additional_brand_site_price: number;
  additional_plain_site_price: number;
  sort_order: number;
  is_active: boolean;
};

export type OptionUpdateREQ = {
  id: number;
  name: string;
  additional_price: number;
  additional_brand_site_price: number;
  additional_plain_site_price: number;
  sort_order: number;
  is_active: boolean;
};
