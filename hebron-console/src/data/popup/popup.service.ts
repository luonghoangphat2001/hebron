import { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { PopupFilterValues } from '@/pages/popup/components/PopupFilter';
import type { PopupInput } from '@/schemas/popup/popup.schema';
import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import { ExposureStatus, SortOrder } from '@/utils/enums/common.enum';
import { ExposureTarget } from '@/utils/enums/content.enum';
import { FileType } from '@/utils/enums/file.enum';
import { PopupLocation, PopupSort } from '@/utils/enums/popup.enum';
import dayjs from 'dayjs';
import type { DateRange } from 'react-day-picker';
import type { PopupCreateREQ, PopupListREQ, PopupUpdateREQ } from './popup.request';
import type { PopupRESP } from './popup.response';

export const getPopupListInitFilter = (searchParams: URLSearchParams): PopupFilterValues => {
  const parseDateRange = (fromKey: string, toKey: string): DateRange | undefined => {
    const from = searchParams.get(fromKey);
    const to = searchParams.get(toKey);
    if (!from && !to) return undefined;
    return {
      from: from ? dayjs(from).toDate() : undefined,
      to: to ? dayjs(to).toDate() : undefined,
    };
  };

  const periodRange = parseDateRange('period_from', 'period_to');
  const exposureRange = parseDateRange('exposure_period_from', 'exposure_period_to');

  return {
    popup_name: searchParams.get('popup_name') || '',
    exposure_location: (searchParams.get('exposure_location') as PopupLocation) || undefined,
    status: (searchParams.get('status') as ExposureStatus) || undefined,
    period_from: periodRange,
    period_to: periodRange,
    registrant_id: searchParams.get('registrant_id') ? Number(searchParams.get('registrant_id')) : null,
    exposure_period_from: exposureRange,
    exposure_period_to: exposureRange,
    sort_by: (searchParams.get('sort_by') as PopupSort) || undefined,
    sort_order: (searchParams.get('sort_order') as SortOrder) || undefined,
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
  };
};

export const transformPopupFilterToREQ = (filter: PopupFilterValues): PopupListREQ => {
  return {
    page: filter.page,
    per_page: filter.per_page,
    popup_name: filter.popup_name || undefined,
    exposure_location: filter.exposure_location,
    status: filter.status,
    registrant_id: filter.registrant_id ?? undefined,
    period_from: filter.period_from?.from ? dayjs(filter.period_from.from).format(DATE_FORMAT) : undefined,
    period_to: filter.period_from?.to ? dayjs(filter.period_from.to).format(DATE_FORMAT) : undefined,
    exposure_period_from: filter.exposure_period_from?.from
      ? dayjs(filter.exposure_period_from.from).format(DATE_FORMAT)
      : undefined,
    exposure_period_to: filter.exposure_period_from?.to ? dayjs(filter.exposure_period_from.to).format(DATE_FORMAT) : undefined,
    sort_by: filter.sort_by,
    sort_order: filter.sort_order,
  };
};

export const transformPopupRESPToInput = (resp: PopupRESP): PopupInput => {
  const popup = (resp as any)?.popup || resp;
  const rawTarget = popup?.exposure_target;
  const target = Array.isArray(rawTarget)
    ? (rawTarget[0] as ExposureTarget)
    : (rawTarget as ExposureTarget) || ExposureTarget.ALL;

  return {
    name: popup?.name ?? '',
    content: popup?.content ?? '',
    image_path: popup?.image_path ?? '',
    exposure_target: target,
    exposure_location: popup?.exposure_location as PopupLocation,
    width: popup?.size_settings?.width ?? popup?.width ?? 800,
    height: popup?.size_settings?.height ?? popup?.height ?? 600,
    status: (popup?.status?.value || popup?.status) as ExposureStatus,
    exposure_start_date: popup?.exposure_start_date ?? '',
    exposure_end_date: popup?.exposure_end_date ?? '',
  };
};

export const transformPopupInputToCreateREQ = (input: PopupInput): PopupCreateREQ => {
  return {
    name: input.name,
    content: input.content || undefined,
    image_path: input.image_path,
    exposure_target: input.exposure_target,
    exposure_location: input.exposure_location,
    width: Number(input.width),
    height: Number(input.height),
    status: input.status,
    exposure_start_date: input.exposure_start_date,
    exposure_end_date: input.exposure_end_date,
  };
};

export const transformPopupInputToUpdateREQ = (id: number, input: PopupInput): PopupUpdateREQ => {
  return { ...transformPopupInputToCreateREQ(input), id };
};

const parseValidDate = (dateStr?: string | null): Date | undefined => {
  if (!dateStr) return undefined;
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

export const popupDatesToDateRange = (start?: string | null, end?: string | null): DateRange | undefined => {
  const from = parseValidDate(start);
  const to = parseValidDate(end);
  if (!from && !to) return undefined;
  return { from, to };
};

export const dateRangeToPopupDates = (range: DateRange | undefined) => ({
  exposure_start_date:
    range?.from && dayjs(range.from).isValid() ? dayjs(range.from).startOf('day').format(DATE_TIME_FORMAT) : '',
  exposure_end_date: range?.to && dayjs(range.to).isValid() ? dayjs(range.to).endOf('day').format(DATE_TIME_FORMAT) : '',
});

export const urlToAttachmentValue = (url?: string | null): AttachmentFileValue | undefined => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'popup_image.png';
  return {
    localId: `remote-${url}`,
    name,
    size: 0,
    mime_type: 'image/*',
    remote: {
      id: 0,
      url,
      name,
      size: 0,
      mime_type: 'image/*',
    } as any,
  };
};

export const resolvePopupImage = async (input: PopupInput, attachment?: AttachmentFileValue): Promise<string> => {
  if (!attachment) return input.image_path || '';
  if (attachment.remote?.url) return attachment.remote.url;
  if (attachment.file) {
    const uploaded = await uploadAttachmentFiles(attachment, FileType.POPUPS);
    return uploaded[0]?.url || input.image_path || '';
  }
  return input.image_path || '';
};
