import type { SiteType } from '@/utils/enums/common.enum';

export type Portfolio = {
  id: number;
  site_type: SiteType;
  title: string;
  client: string;
  category: string | null;
  year: number | null;
  description: string;
  cover_image: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioRESP = {
  portfolio: Portfolio;
};

export type PortfolioList = {
  portfolios: Portfolio[];
};

export type PortfolioCategoryItem = {
  id: number;
  name: string;
  slug?: string | null;
  sort_order: number;
  is_active: boolean;
};

export type PortfolioCategoryListRESP = {
  categories: PortfolioCategoryItem[];
};

export type PortfolioCategoryDetailRESP = {
  category: PortfolioCategoryItem;
};
