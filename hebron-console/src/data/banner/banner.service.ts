import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@/utils/constants/date.constant';
import { BannerLocation, BannerSort } from '@/utils/enums/banner.enum';
import { ExposureStatus, PageType, SITE_PAGE_MAP, SiteType, SortOrder } from '@/utils/enums/common.enum';
import { FileType } from '@/utils/enums/file.enum';
import { uploadAttachmentFiles, type AttachmentFileValue } from '@/components/upload/AttachmentFile';
import type { BannerFilterValues } from '@/pages/banner/components/BannerFilter';
import type { BannerCreateREQ, BannerListREQ, BannerUpdateREQ } from './banner.request';
import type { BannerRESP } from './banner.response';
import type { BannerInput } from '@/schemas/banner/banner.schema';
import type { DateRange } from 'react-day-picker';
import dayjs from 'dayjs';

export const getPagesBySiteType = (siteType: SiteType): PageType[] => {
  return SITE_PAGE_MAP[siteType] || [];
};

export const getBannerListInitFilter = (searchParams: URLSearchParams): BannerFilterValues => {
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
    banner_name: searchParams.get('banner_name') || '',
    exposure_location: (searchParams.get('exposure_location') as BannerLocation) || undefined,
    status: (searchParams.get('status') as ExposureStatus) || undefined,
    site_type: (searchParams.get('site_type') as SiteType) || undefined,
    page_type: (searchParams.get('page_type') as PageType) || undefined,
    period_from: periodRange,
    period_to: periodRange,
    registrant_id: searchParams.get('registrant_id') ? Number(searchParams.get('registrant_id')) : null,
    exposure_period_from: exposureRange,
    exposure_period_to: exposureRange,
    sort_by: (searchParams.get('sort_by') as BannerSort) || BannerSort.CREATED_AT,
    sort_order: (searchParams.get('sort_order') as SortOrder) || SortOrder.DESC,
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
  };
};

export const transformBannerFilterToREQ = (filter: BannerFilterValues): BannerListREQ => {
  return {
    page: filter.page,
    per_page: filter.per_page,
    banner_name: filter.banner_name || undefined,
    exposure_location: filter.exposure_location,
    status: filter.status,
    site_type: filter.site_type,
    page_type: filter.page_type,
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

export const transformBannerRESPToInput = (resp: BannerRESP): BannerInput => {
  return {
    name: resp?.banner?.name ?? '',
    image_path: resp?.banner?.image_path ?? '',
    image_path_mobile: resp?.banner?.image_path_mobile ?? null,
    link_url: resp?.banner?.link_url ?? '',
    exposure_location: resp?.banner?.exposure_location as BannerLocation,
    site_type: (resp?.banner?.site_type as SiteType) || SiteType.SHOPPING_MALL,
    page_type: (resp?.banner?.page_type as PageType) || PageType.HOME_PAGE,
    status: resp?.banner?.status.value as ExposureStatus,
    sort_order: resp?.banner?.sort_order ?? 1,
    exposure_start_date: resp?.banner?.exposure_start_date ?? '',
    exposure_end_date: resp?.banner?.exposure_end_date ?? '',
  };
};

export const transformBannerInputToCreateREQ = (input: BannerInput): BannerCreateREQ => {
  return {
    name: input.name,
    image_path: input.image_path,
    image_path_mobile: input.image_path_mobile ?? null,
    link_url: input.link_url,
    exposure_location: BannerLocation.MAIN_HERO,
    site_type: input.site_type,
    page_type: input.page_type,
    status: input.status,
    sort_order: input.sort_order,
    exposure_start_date: input.exposure_start_date,
    exposure_end_date: input.exposure_end_date,
  };
};

export const transformBannerInputToUpdateREQ = (id: number, input: BannerInput): BannerUpdateREQ => {
  return { ...transformBannerInputToCreateREQ(input), id };
};

const parseValidDate = (dateStr?: string | null): Date | undefined => {
  if (!dateStr) return undefined;
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

export const bannerDatesToDateRange = (start?: string | null, end?: string | null): DateRange | undefined => {
  const from = parseValidDate(start);
  const to = parseValidDate(end);
  if (!from && !to) return undefined;
  return { from, to };
};

export const dateRangeToBannerDates = (range: DateRange | undefined) => ({
  exposure_start_date:
    range?.from && dayjs(range.from).isValid() ? dayjs(range.from).startOf('day').format(DATE_TIME_FORMAT) : '',
  exposure_end_date: range?.to && dayjs(range.to).isValid() ? dayjs(range.to).endOf('day').format(DATE_TIME_FORMAT) : '',
});

export const urlToAttachmentValue = (url?: string | null): AttachmentFileValue | undefined => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'banner_image.png';
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

const resolveSingleAttachment = async (attachment?: AttachmentFileValue, fallbackUrl?: string | null): Promise<string | null> => {
  if (!attachment) return null;
  if (attachment.remote?.url) return attachment.remote.url;
  if (attachment.file) {
    const uploaded = await uploadAttachmentFiles(attachment, FileType.BANNERS);
    return uploaded[0]?.url || fallbackUrl || null;
  }
  return fallbackUrl || null;
};

export const resolveBannerImages = async (
  input: BannerInput,
  pcAttachment?: AttachmentFileValue,
  mobileAttachment?: AttachmentFileValue,
): Promise<{ image_path: string; image_path_mobile: string | null }> => {
  const [pcUrl, mobileUrl] = await Promise.all([
    resolveSingleAttachment(pcAttachment, input.image_path),
    resolveSingleAttachment(mobileAttachment, input.image_path_mobile),
  ]);

  return {
    image_path: pcUrl || '',
    image_path_mobile: mobileUrl,
  };
};
