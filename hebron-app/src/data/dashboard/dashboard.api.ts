import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { DashboardREQ } from './dashboard.request';
import type { DashboardRESP } from './dashboard.response';

const ENDPOINTS = {
  DASHBOARD: '/mypage/dashboard',
} as const;

export const dashboardAPI = {
  getDashboard: (params?: DashboardREQ): Promise<BaseRESP<DashboardRESP>> => api.get(ENDPOINTS.DASHBOARD, { params }),
};
