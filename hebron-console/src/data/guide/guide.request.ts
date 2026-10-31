import type { PostingStatus } from '@/utils/enums/common.enum';
import type { GuideType } from '@/utils/enums/content.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type GuideAttachmentREQ = {
  key: string;
  name: string;
  url: string;
  size: number;
};

export type GuideListREQ = PaginationREQ & {
  search_term?: string;
  author_id?: number;
  exposure_status?: PostingStatus;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type GuideCreateREQ = {
  title: string;
  content: string;
  type: GuideType;
  attachments: GuideAttachmentREQ[];
  exposure_status: PostingStatus;
  exposure_start_date: string;
  exposure_end_date?: string | null;
  exposure_target?: string;
};

export type GuideUpdateREQ = GuideCreateREQ & {
  id: number;
};
