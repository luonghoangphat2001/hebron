import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { AdminChangePasswordREQ, AdminCreateREQ, AdminListREQ, AdminUpdateREQ } from './admin.request';
import type { AdminDetailRESP, AdminListRESP, AdminMePermissionsRESP } from './admin.response';

const ENDPOINTS = {
  ROOT: '/admin/user',
  ME_PERMISSIONS: '/admin/me/permissions',
};

export const adminAPI = {
  list: (params?: AdminListREQ): Promise<PaginationRESP<AdminListRESP>> => api.get(ENDPOINTS.ROOT, { params }),
  create: (body: AdminCreateREQ) => api.post(ENDPOINTS.ROOT, body),
  detail: (adminId: number): Promise<BaseRESP<AdminDetailRESP>> => api.get(`${ENDPOINTS.ROOT}/${adminId}`),
  update: (body: AdminUpdateREQ) => api.patch(`${ENDPOINTS.ROOT}/${body.id}`, body),
  changePassword: (body: AdminChangePasswordREQ) => api.put(`${ENDPOINTS.ROOT}/${body.id}/password`, body),
  delete: (adminId: number) => api.delete(`${ENDPOINTS.ROOT}/${adminId}`),
  myPermissions: (): Promise<BaseRESP<AdminMePermissionsRESP>> => api.get(ENDPOINTS.ME_PERMISSIONS),
};
