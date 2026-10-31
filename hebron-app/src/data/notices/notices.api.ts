import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { NoticeListREQ } from './notices.request';
import type { NoticeDetailRESP, NoticeListRESP } from './notices.response';

const ENDPOINTS = {
  LIST: '/mypage/notices',
  DETAIL: (id: number | string) => `/notices/${id}`,
} as const;

export const noticesAPI = {
  getList: (params?: NoticeListREQ): Promise<PaginationRESP<NoticeListRESP>> => api.get(ENDPOINTS.LIST, { params }),
  getDetail: (id: number | string): Promise<BaseRESP<NoticeDetailRESP>> => api.get(ENDPOINTS.DETAIL(id)),
};
