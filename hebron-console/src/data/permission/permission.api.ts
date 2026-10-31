import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  PermissionCopyREQ,
  PermissionCreateREQ,
  PermissionExportExcelREQ,
  PermissionListREQ,
  PermissionSettignREQ,
  PermissionUpdateREQ,
} from './permission.request';
import type { MenuPermissionStructureRESP, PermissionDetailRESP, PermissionListRESP } from './permission.response';

const ENDPOINT = {
  ROOT: '/admin/permissions',
};

export const getPermissionListAPI = (params: PermissionListREQ): Promise<PaginationRESP<PermissionListRESP>> =>
  api.get(ENDPOINT.ROOT, { params });

export const getPermissionDetailAPI = (id: number): Promise<BaseRESP<PermissionDetailRESP>> => api.get(`${ENDPOINT.ROOT}/${id}`);

export const getPermissionMenuStructureAPI = (id: number): Promise<BaseRESP<MenuPermissionStructureRESP>> =>
  api.get(`${ENDPOINT.ROOT}/${id}/menu-structure`);

export const createPermissionAPI = (body: PermissionCreateREQ): Promise<BaseRESP<PermissionDetailRESP>> =>
  api.post(ENDPOINT.ROOT, body);

export const updatePermissionAPI = (body: PermissionUpdateREQ): Promise<BaseRESP<PermissionDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${body.id}`, body);

export const deletePermissionAPI = (id: number): Promise<BaseRESP<null>> => api.delete(`${ENDPOINT.ROOT}/${id}`);

export const copyPermissionAPI = (body: PermissionCopyREQ): Promise<BaseRESP<PermissionDetailRESP>> =>
  api.post(`${ENDPOINT.ROOT}/${body.id}/copy`, body);

export const updatePermissionSettingsAPI = (body: PermissionSettignREQ): Promise<BaseRESP<PermissionDetailRESP>> =>
  api.put(`${ENDPOINT.ROOT}/${body.id}/settings`, body);

export const exportPermissionExcelAPI = (body: PermissionExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${ENDPOINT.ROOT}/export-excel`, body);

export const getPermissionExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/check-progress-status`);

export const downloadPermissionExportAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/download`, { responseType: 'blob' });
