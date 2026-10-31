import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { ExportType, SortOrder } from '@/utils/enums/common.enum';
import { OptionGroupSort } from '@/utils/enums/option-group.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { OptionGroupExportExcelREQ, OptionGroupListREQ } from './option-group.request';

export const getOptionGroupListInitFilter = (searchParams: URLSearchParams): OptionGroupListREQ => {
  const isRequired = searchParams.get('is_required');

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    code: orUndefined(searchParams.get('code')),
    name: orUndefined(searchParams.get('name')),
    display_type: orUndefined(searchParams.get('display_type')),
    is_required: isRequired ? isRequired === 'true' : undefined,
    order_by: (orUndefined(searchParams.get('order_by')) as OptionGroupSort) || OptionGroupSort.CREATE_AT,
    sort_order: (orUndefined(searchParams.get('sort_order')) as SortOrder) || SortOrder.DESC,
  };
};

export const transformOptionGroupFilterToExportREQ = (
  filter: OptionGroupListREQ,
  exportType: ExportType,
  selectedIds: number[] = [],
  currentPage?: number,
  locale = 'en',
): OptionGroupExportExcelREQ => ({
  export_type: exportType,
  selected_ids: exportType === ExportType.SELECTED ? selectedIds : undefined,
  current_page: exportType === ExportType.CURRENT_PAGE ? (currentPage ?? filter.page) : undefined,
  per_page: filter.per_page,
  locale,
  code: filter.code || undefined,
  name: filter.name || undefined,
  display_type: filter.display_type,
  is_required: filter.is_required,
  order_by: filter.order_by,
  sort_order: filter.sort_order,
});
