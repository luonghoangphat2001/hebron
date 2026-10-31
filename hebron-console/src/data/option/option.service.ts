import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import { orUndefined } from '@/utils/helper/string.helper';
import type { OptionListREQ, OptionSortBy } from './option.request';

export const getOptionListInitFilter = (searchParams: URLSearchParams): OptionListREQ => {
  const optionGroupId = searchParams.get('option_group_id');
  const isActive = searchParams.get('is_active');

  return {
    page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
    per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
    option_group_id: optionGroupId ? Number(optionGroupId) : undefined,
    name: orUndefined(searchParams.get('name')),
    is_active: isActive ? isActive === 'true' : undefined,
    sort_by: orUndefined(searchParams.get('sort_by')) as OptionSortBy | undefined,
  };
};
