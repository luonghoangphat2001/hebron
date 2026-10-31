import type { FileAttachmentREQ } from '@/data/files/files.request';
import type { InquiryCategory, InquiryStatus } from '@/utils/enums/inquiry.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type InquiryListREQ = PaginationREQ & {
  category?: InquiryCategory;
  status?: InquiryStatus | string;
  search?: string;
};

export type InquiryCreateREQ = {
  category: InquiryCategory;
  product_id?: number;
  title: string;
  content: string;
  order_number?: string;
  contact: string;
  attachments: FileAttachmentREQ[];
};

export type InquiryUpdateREQ = {
  category: InquiryCategory;
  product_id?: number;
  title: string;
  content: string;
  order_number?: string;
  contact: string;
  attachments?: FileAttachmentREQ[];
};
