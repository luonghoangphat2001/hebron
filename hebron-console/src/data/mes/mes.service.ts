import { INITIAL_PAGING, PAGE_PARAM_KEY, PER_PAGE_PARAM_KEY } from '@/utils/constants/common.constant';
import type { MesDirection, MesLogResult, MesTriggerType } from '@/utils/enums/mes.enum';
import { orUndefined } from '@/utils/helper/string.helper';
import type { MesLogListREQ } from './mes.request';

export const getMesLogListInitFilter = (searchParams: URLSearchParams): MesLogListREQ => ({
  page: Number(searchParams.get(PAGE_PARAM_KEY)) || INITIAL_PAGING.page,
  per_page: Number(searchParams.get(PER_PAGE_PARAM_KEY)) || INITIAL_PAGING.per_page,
  keyword: orUndefined(searchParams.get('keyword')),
  direction: orUndefined(searchParams.get('direction')) as MesDirection | undefined,
  trigger_type: orUndefined(searchParams.get('trigger_type')) as MesTriggerType | undefined,
  status: orUndefined(searchParams.get('status')) as MesLogResult | undefined,
  start_date: orUndefined(searchParams.get('start_date')),
  end_date: orUndefined(searchParams.get('end_date')),
});
