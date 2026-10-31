import type { HttpMethod } from '../enums/mes.enum';
import { MesLogResult } from '../enums/mes.enum';

export const MES_RESULT_BADGE: Record<MesLogResult, string> = {
  [MesLogResult.SUCCESS]: 'bg-green-100 text-green-600 rounded-sm',
  [MesLogResult.FAILED]: 'bg-red-100 text-red-600 rounded-sm',
};

// Color per HTTP method chip
export const MES_METHOD_BADGE: Record<HttpMethod, string> = {
  GET: 'bg-sky-100 text-sky-700 rounded-sm',
  POST: 'bg-emerald-100 text-emerald-700 rounded-sm',
  PUT: 'bg-amber-100 text-amber-700 rounded-sm',
  PATCH: 'bg-violet-100 text-violet-700 rounded-sm',
  DELETE: 'bg-red-100 text-red-700 rounded-sm',
};
