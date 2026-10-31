import type { SiteType } from '@/utils/enums/common.enum';
import type { PaginationREQ } from '@/utils/types/request.type';
import type { PortfolioCategoryKey } from './portfolios.response';

export type PortfolioListREQ = PaginationREQ & {
  site_type?: Extract<SiteType, 'BRAND_SITE' | 'PLAIN_SITE'> | string;
  category?: PortfolioCategoryKey | string;
  is_featured?: boolean;
  title?: string;
};
