import type { InquirySortBy, InquiryStatus, InquiryType, SendVia } from '@/utils/enums/inquiry.enum';
import type { ExportExcelBaseREQ } from '@/utils/types/export.type';
import type { PaginationREQ, SortREQ } from '@/utils/types/request.type';

export type InquiryListREQ = PaginationREQ &
  SortREQ & {
    search_term?: string;
    inquiry_type?: InquiryType;
    customer_name?: string;
    inquirer_name?: string;
    status?: InquiryStatus;
    assigned_to?: number;
    created_from?: string;
    created_to?: string;
    has_attachment?: boolean;
    sort_by?: InquirySortBy;
  };

export type InquiryReplyCreateREQ = {
  channels?: (SendVia | string)[];
  send_notification?: boolean;
  notification_channels?: string[];
  contact_phone?: string;
  reply_content: string;
  attachments: AttachmentCreate[];
};

export type AttachmentCreate = {
  key: string;
  name: string;
  url: string;
  size: number;
};

export type InquiryReplyUpdateREQ = InquiryReplyCreateREQ & {
  reply_id: number;
};

export type InquiryMemoCreateREQ = {
  inquiry_id: number;
  content: string;
};

export type InquiryAssignREQ = {
  inquiry_id: number;
  person_in_charge: string;
};

export type InquiryExportExcelREQ = Omit<InquiryListREQ, 'page'> & ExportExcelBaseREQ;
