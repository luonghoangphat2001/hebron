import { useQuery } from '@tanstack/react-query';
import { calligraphiesAPI } from './calligraphies.api';
import type { GetCalligraphiesREQ } from './calligraphies.request';

export const CALLIGRAPHY_QUERY_KEYS = {
  all: ['calligraphies'] as const,
  list: (params?: GetCalligraphiesREQ) => [...CALLIGRAPHY_QUERY_KEYS.all, 'list', params] as const,
};

export const useCalligraphiesQuery = (params?: GetCalligraphiesREQ, enabled = true) =>
  useQuery({
    queryKey: CALLIGRAPHY_QUERY_KEYS.list(params),
    queryFn: () => calligraphiesAPI.getList(params),
    enabled,
  });
