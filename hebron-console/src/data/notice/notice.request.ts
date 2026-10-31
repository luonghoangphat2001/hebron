import type { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import type { ExposureLocation, NoticeType } from '@/utils/enums/content.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type NoticeAttachmentREQ = {
  key: string;
  name: string;
  url: string;
  size: number;
};

export type NoticeListREQ = PaginationREQ & {
  search_term?: string;
  category?: number;
  author_id?: number;
  exposure_status?: PostingStatus;
  exposure_location?: ExposureLocation;
  site_type?: SiteType;
  exposure_start_date?: string;
  exposure_end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type NoticeCreateREQ = {
  title: string;
  content: string;
  category: number;
  type: NoticeType;
  site_type: SiteType;
  attachments: NoticeAttachmentREQ[];
  is_pinned: boolean;
  exposure_status: PostingStatus;
  exposure_location: ExposureLocation;
  exposure_start_date: string;
  exposure_end_date?: string | null;
};

export type NoticeUpdateREQ = NoticeCreateREQ & {
  id: number;
};

export type NoticeCategoryListREQ = {
  keyword?: string;
  is_active?: boolean;
};

export type NoticeCategoryUpsertREQ = {
  name: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
};
