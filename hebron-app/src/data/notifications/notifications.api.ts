import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { NotificationListREQ } from './notifications.request';
import type { NotificationItemRESP, NotificationListRESP } from './notifications.response';

const ENDPOINTS = {
  LIST: '/mypage/notifications',
  MARK_READ: (id: string) => `/mypage/notifications/${id}/read`,
  MARK_READ_ALL: '/mypage/notifications/read-all',
} as const;

export const notificationsAPI = {
  getList: (params?: NotificationListREQ): Promise<BaseRESP<NotificationListRESP>> => api.get(ENDPOINTS.LIST, { params }),
  markAsRead: (id: string): Promise<BaseRESP<NotificationItemRESP | null>> => api.patch(ENDPOINTS.MARK_READ(id)),
  markAllAsRead: (): Promise<BaseRESP<null>> => api.patch(ENDPOINTS.MARK_READ_ALL),
};
