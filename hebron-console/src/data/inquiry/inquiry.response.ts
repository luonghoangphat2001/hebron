import type { LogAction } from '@/utils/enums/common.enum';
import type { InquiryStatus, InquiryType } from '@/utils/enums/inquiry.enum';

export type InquiryAttachmentRESP = {
  id?: number;
  file_name?: string;
  file_url?: string;
  file_size?: number;
  uploaded_at?: string;
  name?: string;
  url?: string;
  size?: number;
  key?: string;
};

export type InquiryReplyUserRESP = {
  id: number;
  name: string;
};

export type InquiryReplyItemRESP = {
  id: number;
  inquiry_id: number;
  content: string;
  created_by: InquiryReplyUserRESP;
  contact_phone?: string | null;
  notification_channel: string | null;
  notification_sent: boolean | null;
  notification_sent_at: string | null;
  notification_status: string | null;
  send_notification?: boolean | null;
  notification_channels?: string[] | null;
  attachments: InquiryAttachmentRESP[];
  created_at: string;
  updated_at: string;
};

export type InquiryReplyListRESP = {
  replies: InquiryReplyItemRESP[];
};

export type InquiryReplyRESP = InquiryReplyItemRESP;

export type InquiryMemoUserRESP = {
  id: number;
  name: string;
  email?: string;
};

export type InquiryMemoRESP = {
  id: number;
  content: string;
  created_by: InquiryMemoUserRESP | string;
  created_at: string;
};

export type InquiryMemoListRESP = {
  memos: InquiryMemoRESP[];
};

export type ActivityLogEntryRESP = {
  id: number;
  action: LogAction;
  actor: string;
  changes: Record<string, string>;
  created_at: string;
};

export type InquiryAuditLogUserRESP = {
  id: number;
  name: string;
  email?: string;
};

export type InquiryAuditLogItemRESP = {
  id: number;
  inquiry_id: number;
  action: string;
  field?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  changed_by: InquiryAuditLogUserRESP;
  changed_at: string;
  ip_address?: string | null;
};

export type InquiryAuditLogListRESP = {
  audit_logs: InquiryAuditLogItemRESP[];
};

export type InquiryTimelineUserRESP = {
  id: number;
  name: string;
};

export type InquiryTimelineItemRESP = {
  id: number;
  inquiry_id: number;
  event_type: string;
  event_type_label?: string;
  title: string;
  description?: string | null;
  created_by?: InquiryTimelineUserRESP | string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
};

export type InquiryTimelineListRESP = {
  timeline: InquiryTimelineItemRESP[];
};

export type RelatedInquiryRESP = {
  id: number;
  inquiry_number?: string;
  code?: string;
  title: string;
  status: InquiryStatus;
  status_label?: string;
  created_at: string;
  relation_type?: string;
  relation_type_label?: string;
};

export type InquiryRelatedListRESP = {
  related_inquiries: RelatedInquiryRESP[];
};

export type InquiryAssignedUserRESP = {
  id: number;
  name: string;
};

export type InquiryRESP = {
  id: number;
  inquiry_number: string;
  inquiry_type: InquiryType;
  inquiry_type_label?: string;
  title: string;
  content?: string;
  customer_id?: string | number | null;
  customer_name?: string | null;
  inquirer_name?: string;
  inquirer_email?: string;
  inquirer_phone?: string;
  inquirer_department?: string | null;
  status: InquiryStatus;
  status_label?: string;
  priority?: string | null;
  priority_label?: string | null;
  assigned_to?: InquiryAssignedUserRESP | string | null;
  has_attachment?: boolean;
  attachment_count?: number;
  reply_count?: number;
  attachments?: InquiryAttachmentRESP[];
  created_at: string;
  updated_at: string;
  related_order_number?: string | null;
  related_design_id?: string | null;
  product?: any | null;

  activity_log?: ActivityLogEntryRESP[];
  related_inquiries?: RelatedInquiryRESP[];
};

export type InquiryDetailRESP = {
  inquiry: InquiryRESP;
};

export type Inquiry = {
  id: number;
  inquiry_number: string;
  inquiry_type: InquiryType;
  inquiry_type_label?: string;
  title: string;
  customer_id: string | number | null;
  customer_name?: string;
  inquirer_name?: string;
  inquirer_email?: string;
  inquirer_phone?: string;
  status: InquiryStatus;
  status_label?: string;
  priority?: string | null;
  priority_label?: string | null;
  assigned_to?: InquiryAssignedUserRESP | string | null;
  has_attachment?: boolean;
  attachment_count?: number;
  created_at: string;
  updated_at: string;
  reply_count?: number;
};

export type InquiryListItemRESP = {
  inquiries: Inquiry[];
};
