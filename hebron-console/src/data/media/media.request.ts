import type { SiteType } from '@/utils/enums/common.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type MediaListREQ = PaginationREQ & {
  site_type?: SiteType;
  category_id?: number;
  is_active?: boolean;
  keyword?: string;
};

export type MediaCreateREQ = {
  site_type: SiteType;
  category_id: number;
  title: string;
  description?: string | null;
  file_path?: string | null;
  thumbnail_path?: string | null;
  url?: string | null;
  link_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type MediaUpdateREQ = MediaCreateREQ;

export type MediaCategoryListREQ = {
  keyword?: string;
  is_active?: boolean;
  site_type?: SiteType;
};

export type MediaCategoryUpsertREQ = {
  name: string;
  slug?: string;
  site_type?: SiteType;
  sort_order?: number;
  is_active?: boolean;
};
