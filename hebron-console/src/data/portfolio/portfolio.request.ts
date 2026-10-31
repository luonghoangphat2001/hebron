import type { SiteType, SortOrder } from '@/utils/enums/common.enum';
import type { PortfolioSort } from '@/utils/enums/portfolio.enum';

export type PortfolioListREQ = {
  page?: number;
  per_page?: number;
  title?: string;
  category?: string;
  is_featured?: boolean;
  is_active?: boolean;
  site_type?: SiteType;
  year?: number;
  sort_by?: PortfolioSort;
  sort_order?: SortOrder;
};

export type PortfolioCreateREQ = {
  site_type: SiteType;
  title: string;
  client: string;
  category: string;
  year: number;
  description: string;
  cover_image: string | null;
  is_featured: boolean;
  is_active?: boolean;
  sort_order: number;
};

export type PortfolioUpdateREQ = PortfolioCreateREQ & { id: number };

export type PortfolioCategoryListREQ = {
  keyword?: string;
  is_active?: boolean;
};

export type PortfolioCategoryUpsertREQ = {
  name: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
};
