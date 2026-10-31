import type { MesDirection, MesLogResult, MesTriggerType } from '@/utils/enums/mes.enum';
import type { PaginationREQ } from '@/utils/types/request.type';

export type MesLogListREQ = PaginationREQ & {
  keyword?: string;
  direction?: MesDirection;
  trigger_type?: MesTriggerType;
  status?: MesLogResult;
  start_date?: string;
  end_date?: string;
};
