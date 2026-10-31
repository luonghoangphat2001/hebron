import type { NoticeAttachment } from '@/data/files/files.request';

export type NoticeListREQ = {
  page?: number;
  per_page?: number;
  title?: string;
};

/** Create/update notice — attachments use Notice-only legacy shape. */
export type NoticeCreateREQ = {
  title: string;
  content: string;
  type: string;
  is_pinned?: boolean;
  exposure_status?: string;
  exposure_location?: string;
  exposure_start_date?: string;
  exposure_end_date?: string | null;
  attachments: NoticeAttachment[];
};

export type NoticeUpdateREQ = NoticeCreateREQ;
