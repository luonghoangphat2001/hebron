import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { dashboardAPI } from './dashboard.api';
import type { DashboardREQ } from './dashboard.request';
import type { DashboardRESP } from './dashboard.response';

export const DASHBOARD_QUERY_KEYS = {
  all: ['mypage-dashboard'] as const,
  detail: (params?: DashboardREQ) => [...DASHBOARD_QUERY_KEYS.all, 'detail', params] as const,
};

export const useDashboardQuery = (
  params?: DashboardREQ,
  options?: Omit<UseQueryOptions<BaseRESP<DashboardRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.detail(params),
    queryFn: () => dashboardAPI.getDashboard(params),
    refetchInterval: 15000,
    ...options,
  });
