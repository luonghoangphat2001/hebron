import type { SiteType } from '@/utils/enums/common.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type MediaListREQ = PaginationREQ & {
  site_type?: SiteType | string;
  category_id?: number;
  per_page?: number;
};
