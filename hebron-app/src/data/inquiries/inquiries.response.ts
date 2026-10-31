import type { FileAttachmentRESP } from '@/data/files/files.response';
import type { InquiryCategory, InquiryStatus } from '@/utils/enums/inquiry.enum';

export type InquiryProductRESP = {
  id: number;
  name: string;
  name_en: string | null;
  sku: string;
  images: string[];
};

export type InquiryCommentRESP = {
  id: number;
  author_name: string;
  content: string;
  is_admin: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  attachments?: FileAttachmentRESP[];
};

export type InquiryItemRESP = {
  id: number;
  category: InquiryCategory | string;
  category_label: string;
  category_label_en: string;
  title: string;
  content: string;
  order_number?: string | null;
  contact: string;
  status: InquiryStatus | string;
  status_label: string;
  status_label_en: string;
  author_name: string;
  product_id?: number | null;
  product?: InquiryProductRESP | null;
  created_at: string;
  updated_at: string;
  comments: InquiryCommentRESP[];
  attachments: FileAttachmentRESP[];
  is_new?: boolean;
};

export type InquiryListRESP = {
  inquiries: InquiryItemRESP[];
};

export type InquiryDetailRESP = {
  inquiry: InquiryItemRESP;
};
