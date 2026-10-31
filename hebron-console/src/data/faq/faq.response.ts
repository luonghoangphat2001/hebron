import type { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import type { ExposureTarget, FAQCategory } from '@/utils/enums/content.enum';

export type FAQPostingStatusRESP = {
  value: PostingStatus;
  label: string;
};

export type FAQAuthorRESP = {
  id: number;
  username: string;
  name: string;
};

export type FAQRESP = {
  id: number;
  category: FAQCategory | string;
  question: string;
  answer: string;
  sort_order: number;
  view_count: number | null;
  posting_status: FAQPostingStatusRESP;
  exposure_target: ExposureTarget | ExposureTarget[];
  site_type: SiteType | string;
  author: FAQAuthorRESP | null;
  created_at: string;
  updated_at: string;
};

export type FAQListRESP = {
  faqs: FAQRESP[];
};

export type FAQDetailRESP = {
  faq: FAQRESP;
};

export type FAQCreateRESP = FAQDetailRESP;

export type FAQCategoryItem = {
  id: number;
  name: string;
  slug?: string | null;
  sort_order: number;
  is_active: boolean;
};

export type FAQCategoryListRESP = {
  categories: FAQCategoryItem[];
};

export type FAQCategoryDetailRESP = {
  category: FAQCategoryItem;
};
