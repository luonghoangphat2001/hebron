import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { ExportType, type Status } from '@/utils/enums/common.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { PermissionExportExcelREQ, PermissionListREQ } from './permission.request';

export const getPermissionListInitFilter = (searchParams: URLSearchParams): PermissionListREQ => ({
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
  search: orUndefined(searchParams.get('search')),
  usage_status: orUndefined(searchParams.get('usage_status')) as Status | undefined,
  sort_by: orUndefined(searchParams.get('sort_by')),
  sort_order: orUndefined(searchParams.get('sort_order')) as 'asc' | 'desc' | undefined,
});

export const nextCopyName = (name: string): string => {
  const match = name.match(/^(.*)\((\d+)\)$/);
  if (!match) return `${name} (1)`;
  return `${match[1].trimEnd()} (${Number(match[2]) + 1})`;
};

export const transformPermissionFilterToExportREQ = (
  filter: PermissionListREQ,
  exportType: ExportType,
  selectedIds: number[] = [],
  currentPage?: number,
  locale = 'en',
): PermissionExportExcelREQ => ({
  export_type: exportType,
  selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
  current_page: exportType === ExportType.CURRENT_PAGE ? (currentPage ?? filter.page) : undefined,
  per_page: filter.per_page,
  locale,
  search: filter.search,
  usage_status: filter.usage_status,
  sort_by: filter.sort_by,
  sort_order: filter.sort_order,
});
