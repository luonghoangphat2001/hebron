import type { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import type { ExposureTarget } from '@/utils/enums/content.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type FAQListREQ = PaginationREQ & {
  faq_category?: string;
  title?: string;
  author_id?: number;
  posting_status?: PostingStatus;
  exposure_target?: ExposureTarget;
  site_type?: SiteType;
  registration_date_from?: string;
  registration_date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type FAQCreateREQ = {
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  posting_status: PostingStatus;
  exposure_target: ExposureTarget[];
  site_type: SiteType;
};

export type FAQCategoryListREQ = {
  keyword?: string;
  is_active?: boolean;
};

export type FAQCategoryUpsertREQ = {
  name: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type FAQUpdateREQ = FAQCreateREQ & {
  id: number;
};
