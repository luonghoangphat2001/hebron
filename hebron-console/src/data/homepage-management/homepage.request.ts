import type { PageType, SectionType, SiteType } from '@/utils/enums/common.enum';

export type PageListREQ = {
  site_type?: SiteType;
  page_type?: PageType;
};

export type UpdatePageSectionREQ = {
  section_type?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  content?: Record<string, any> | any[];
  image?: string | null;
  link?: string | null;
  craftsmanship_value_ids?: number[] | null;
  sort_order?: number;
  is_active?: boolean;
  metadata?: any | null;
};

export type UpdatePageSectionParams = {
  siteType: SiteType | string;
  pageType: PageType | string;
  sectionType: SectionType | string;
  body: UpdatePageSectionREQ;
};
