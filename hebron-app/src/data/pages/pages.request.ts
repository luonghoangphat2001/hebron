import type { SiteType } from '@/utils/enums/common.enum';

export type PageBySlugREQ = {
  slug: string;
  site_type?: SiteType | string;
};

export type HomeREQ = {
  site_type?: SiteType | string;
};

export const BRAND_HOME_PAGE_SLUG = 'home' as const;
export const HOME_PAGE_SLUG = 'home' as const;
export const BRAND_STORY_PAGE_SLUG = 'brand-story' as const;
export const BRAND_PROCESS_PAGE_SLUG = 'process' as const;
export const BRAND_MEDIA_PAGE_SLUG = 'media' as const;
export const BRAND_CONTACT_PAGE_SLUG = 'contact_us' as const;
export const BRAND_PRODUCTION_INQUIRY_PAGE_SLUG = 'production-inquiry' as const;
export const BRAND_PORTFOLIO_PAGE_SLUG = 'portfolio' as const;
export const BRAND_FAQS_PAGE_SLUG = 'faqs' as const;
export const BRAND_PRODUCTS_PAGE_SLUG = 'products-standard' as const;
