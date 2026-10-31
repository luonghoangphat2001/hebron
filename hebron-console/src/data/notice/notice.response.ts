import type { PostingStatus, SiteType } from '@/utils/enums/common.enum';
import type { ExposureLocation, NoticeType } from '@/utils/enums/content.enum';

export type NoticeExposureStatusRESP = {
  value: PostingStatus;
  label: string;
};

export type NoticeAuthorRESP = {
  id: number;
  username: string;
  name: string;
};

export type NoticeAttachmentRESP = {
  no?: number;
  key?: string;
  name: string;
  url: string;
  size?: number;
};

export type NoticeRESP = {
  id: number;
  title: string;
  content: string;
  category?: number | string | NoticeCategoryItem | null;
  type: NoticeType | string;
  site_type?: SiteType;
  attachments: NoticeAttachmentRESP[] | null;
  is_pinned: boolean;
  view_count: number | null;
  exposure_status: NoticeExposureStatusRESP;
  /** `["all"]` / `"all"` / customer ids */
  exposure_target: Array<number | string> | string | null;
  exposure_location: ExposureLocation | string | null;
  exposure_start_date: string | null;
  exposure_end_date: string | null;
  author: NoticeAuthorRESP | null;
  created_at: string;
  updated_at: string;
};

export type NoticeListRESP = {
  notices: NoticeRESP[];
};

export type NoticeDetailRESP = {
  notice: NoticeRESP;
};

export type NoticeCreateRESP = NoticeDetailRESP;

export type NoticeCategoryItem = {
  id: number;
  name: string;
  slug?: string | null;
  page_type?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type NoticeCategoryListRESP = {
  categories: NoticeCategoryItem[];
};

export type NoticeCategoryDetailRESP = {
  category: NoticeCategoryItem;
};
