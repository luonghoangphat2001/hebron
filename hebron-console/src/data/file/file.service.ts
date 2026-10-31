import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { DATE_FORMAT } from '@/utils/constants/date.constant';
import type { SortOrder } from '@/utils/enums/common.enum';
import type { FileUploadedSortBy } from '@/utils/enums/file.enum';
import type { UploadedImageFilterValues } from '@/pages/uploaded-image/components/UploadedImageFilter';
import type { FileUploadedREQ } from './file.request';
import type { DateRange } from 'react-day-picker';
import dayjs from 'dayjs';

export const getUploadedImageListInitFilter = (searchParams: URLSearchParams): UploadedImageFilterValues => {
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

  return {
    name: searchParams.get('name') || '',
    type: searchParams.get('type') || undefined,
    author_id: searchParams.get('author_id') ? Number(searchParams.get('author_id')) : null,
    period_from: periodRange,
    period_to: periodRange,
    sort_by: (searchParams.get('sort_by') as FileUploadedSortBy) || undefined,
    sort_order: (searchParams.get('sort_order') as SortOrder) || undefined,
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page || 1,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page || 10,
  };
};

export const transformUploadedImageFilterToREQ = (filter: UploadedImageFilterValues): FileUploadedREQ => {
  return {
    page: filter.page,
    per_page: filter.per_page,
    name: filter.name || undefined,
    type: filter.type || undefined,
    created_by: filter.author_id ?? undefined,
    start_date: filter.period_from?.from ? dayjs(filter.period_from.from).format(DATE_FORMAT) : undefined,
    end_date: filter.period_from?.to ? dayjs(filter.period_from.to).format(DATE_FORMAT) : undefined,
    sort_by: filter.sort_by,
    sort_order: filter.sort_order,
  };
};
