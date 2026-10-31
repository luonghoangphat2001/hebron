import type { NoticeAttachment } from '@/data/files/files.request';

export type NoticeTypeKey = 'important' | 'maintenance' | 'general';

export type NoticeItemRESP = {
  id: number;
  title: string;
  content: string;
  type: NoticeTypeKey | string;
  attachments: NoticeAttachment[];
  is_pinned: boolean;
  is_new: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
};

export type NoticeListRESP = {
  notices: NoticeItemRESP[];
};

export type NoticeDetailRESP = {
  notice: NoticeItemRESP;
};
