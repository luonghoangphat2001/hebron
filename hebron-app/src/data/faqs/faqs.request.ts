import type { BrandFAQCategoryKey, FAQCategoryKey } from '@/data/faqs/faqs.response';
import type { SiteType } from '@/utils/enums/common.enum';
export type FAQListREQ = {
  page?: number;
  per_page?: number;
  category?: FAQCategoryKey | string;
  search?: string;
  site_type?: SiteType;
};

export type BrandFAQListREQ = {
  page?: number;
  per_page?: number;
  category?: BrandFAQCategoryKey | string;
  search?: string;
};
