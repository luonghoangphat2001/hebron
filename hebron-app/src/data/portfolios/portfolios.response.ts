import type { SiteType } from '@/utils/enums/common.enum';

/** Mirrors backend portfolio category enum string values. */
export const PORTFOLIO_CATEGORY = {
  MAJOR_PROJECT: 'major_project',
  CORPORATE_PLAQUE: 'corporate_plaque',
  TROPHY: 'trophy',
} as const;

export type PortfolioCategoryKey = (typeof PORTFOLIO_CATEGORY)[keyof typeof PORTFOLIO_CATEGORY];

export type PortfolioItemRESP = {
  id: number;
  site_type: Extract<SiteType, 'BRAND_SITE' | 'PLAIN_SITE'> | string;
  title: string;
  client: string;
  category: PortfolioCategoryKey | string;
  year: number;
  description: string;
  cover_image: string;
  gallery: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioListRESP = {
  portfolios: PortfolioItemRESP[];
};

export type PortfolioDetailRESP = {
  portfolio: PortfolioItemRESP;
};

export type BrandPortfolioBannerRESP = {
  id: number;
  name: string;
  image_path: string;
  image_url: string;
  image_path_mobile: string | null;
  image_url_mobile: string | null;
  link_url: string | null;
  exposure_location: string;
  sort_order: number;
  site_type: Extract<SiteType, 'BRAND_SITE' | 'PLAIN_SITE'> | string;
};

export type BrandPortfolioBannerListRESP = {
  banners: BrandPortfolioBannerRESP[];
};
