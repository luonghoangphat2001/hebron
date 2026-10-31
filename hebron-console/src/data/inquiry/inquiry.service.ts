import type { AttachmentFileValue } from '@/components/upload/AttachmentFile';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import { ExportType, type SortOrder } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import type { InquirySortBy, InquiryStatus, InquiryType } from '@/utils/enums/inquiry.enum';
import { getFileUrl } from '@/utils/helper/common.helper';
import type { InquiryFilterValues } from '@/pages/inquiry/components/InquiryFilter';
import type { InquiryExportExcelREQ, InquiryListREQ } from './inquiry.request';
import type { InquiryAttachmentRESP, InquiryReplyItemRESP } from './inquiry.response';
import type { DateRange } from 'react-day-picker';
import dayjs from 'dayjs';

export const DEFAULT_INQUIRY_FILTER: InquiryFilterValues = {
  search_term: '',
  inquiry_type: undefined,
  customer_name: '',
  inquirer_name: '',
  status: undefined,
  assigned_to: null,
  created_period: undefined,
  has_attachment: undefined,
  sort_by: undefined,
  sort_order: undefined,
  page: 1,
  per_page: 10,
};

export const getInquiryListInitFilter = (searchParams: URLSearchParams): InquiryFilterValues => {
  const parseDateRange = (fromKey: string, toKey: string): DateRange | undefined => {
    const from = searchParams.get(fromKey);
    const to = searchParams.get(toKey);
    if (!from && !to) return undefined;
    return {
      from: from ? dayjs(from).toDate() : undefined,
      to: to ? dayjs(to).toDate() : undefined,
    };
  };

  const createdRange = parseDateRange('created_from', 'created_to');

  return {
    search_term: searchParams.get('search_term') || '',
    inquiry_type: (searchParams.get('inquiry_type') as InquiryType) || undefined,
    customer_name: searchParams.get('customer_name') || '',
    inquirer_name: searchParams.get('inquirer_name') || '',
    status: (searchParams.get('status') as InquiryStatus) || undefined,
    assigned_to: searchParams.get('assigned_to') ? Number(searchParams.get('assigned_to')) : null,
    created_period: createdRange,
    has_attachment: searchParams.get('has_attachment') ? searchParams.get('has_attachment') === 'true' : undefined,
    sort_by: (searchParams.get('sort_by') as InquirySortBy) || undefined,
    sort_order: (searchParams.get('sort_order') as SortOrder) || undefined,
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
  };
};

export const transformInquiryFilterToREQ = (filter: InquiryFilterValues): InquiryListREQ => {
  return {
    page: filter.page,
    per_page: filter.per_page,
    search_term: filter.search_term || undefined,
    inquiry_type: filter.inquiry_type,
    customer_name: filter.customer_name || undefined,
    inquirer_name: filter.inquirer_name || undefined,
    status: filter.status,
    assigned_to: filter.assigned_to ?? undefined,
    created_from: filter.created_period?.from ? dayjs(filter.created_period.from).format(DATE_FORMAT) : undefined,
    created_to: filter.created_period?.to ? dayjs(filter.created_period.to).format(DATE_FORMAT) : undefined,
    has_attachment: filter.has_attachment,
    sort_by: filter.sort_by,
    sort_order: filter.sort_order,
  };
};

export const transformInquiryAttachmentsToAttachmentValues = (attachments?: InquiryAttachmentRESP[]): AttachmentFileValue[] => {
  if (!attachments || attachments.length === 0) return [];
  return attachments.map((att, idx) => {
    const name = att.file_name || att.name || 'file';
    const path = att.file_url || att.url || '';
    const size = att.file_size || att.size || 0;
    const uniqueId = att.id != null && att.id !== 0 ? att.id : `${idx}-${name}-${size}`;

    return {
      localId: `remote-${uniqueId}`,
      name,
      size,
      mime_type: '',
      remote: {
        id: att.id || 0,
        name,
        path,
        url: getFileUrl(path),
        size,
        mime_type: '',
        type: FileType.INQUIRY_ATTACHMENTS,
        created_by: { id: 0, name: '' },
        created_at: att.uploaded_at || '',
        updated_at: att.uploaded_at || '',
      },
    };
  });
};

export const transformInquiryFilterToExportREQ = (
  filter: InquiryFilterValues,
  exportType: ExportType,
  selectedIds: number[] = [],
  currentPage?: number,
  locale = 'en',
): InquiryExportExcelREQ => {
  return {
    export_type: exportType,
    selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
    current_page: exportType === ExportType.CURRENT_PAGE ? (currentPage ?? filter.page) : undefined,
    per_page: filter.per_page,
    locale,
    search_term: filter.search_term || undefined,
    inquiry_type: filter.inquiry_type,
    customer_name: filter.customer_name || undefined,
    inquirer_name: filter.inquirer_name || undefined,
    status: filter.status,
    assigned_to: filter.assigned_to ?? undefined,
    created_from: filter.created_period?.from ? dayjs(filter.created_period.from).format(DATE_FORMAT) : undefined,
    created_to: filter.created_period?.to ? dayjs(filter.created_period.to).format(DATE_FORMAT) : undefined,
    has_attachment: filter.has_attachment,
    sort_by: filter.sort_by,
    sort_order: filter.sort_order,
  };
};

export type NormalizedReplyNotificationInfo = {
  isSend: boolean;
  channels: string[];
};

export const parseNotificationChannels = (
  notificationChannel?: string | string[] | null,
  notificationChannels?: string[] | null,
): string[] => {
  const raw = notificationChannels ?? notificationChannel ?? [];
  const list = Array.isArray(raw) ? raw : raw.split(',');
  return list
    .map((c) => (c.toLowerCase().includes('kakao') ? 'kakao' : c.toLowerCase().includes('mail') ? 'email' : ''))
    .filter(Boolean);
};

export const getReplyNotificationInfo = (reply: InquiryReplyItemRESP): NormalizedReplyNotificationInfo => {
  const channels = parseNotificationChannels(reply.notification_channel, reply.notification_channels);
  const isSend = Boolean(reply.send_notification ?? reply.notification_sent ?? channels.length > 0);
  return { isSend, channels };
};
