import { api } from '@/api';
import type { PaginationRESP } from '@/utils/types/response.type';
import type { GetCalligraphiesREQ } from './calligraphies.request';
import type { GetCalligraphiesRESP } from './calligraphies.response';

export const calligraphiesAPI = {
  getList: (params?: GetCalligraphiesREQ): Promise<PaginationRESP<GetCalligraphiesRESP>> => api.get('/calligraphies', { params }),
};
