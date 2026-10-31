import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type {
  MemberActivityLogsREQ,
  MemberBasicInfoUpdateREQ,
  MemberCreateREQ,
  MemberExportExcelREQ,
  MemberListREQ,
  MemberPasswordUpdateREQ,
} from './member.request';
import type {
  MemberActivityLogsRESP,
  MemberCreatedDataRESP,
  MemberDetailDataRESP,
  MemberListRESP,
  MemberPermissionInfoRESP,
} from './member.respsonse';

const ENDPOINT = {
  ROOT: '/admin/members',
};

export const getMemberListAPI = (params: MemberListREQ): Promise<PaginationRESP<MemberListRESP>> =>
  api.get(ENDPOINT.ROOT, { params: { ...params, authority: 'normal_user' } });

export const getMemberDetailAPI = (id: number): Promise<BaseRESP<MemberDetailDataRESP>> => api.get(`${ENDPOINT.ROOT}/${id}`);

export const createMemberAPI = (body: MemberCreateREQ): Promise<BaseRESP<MemberCreatedDataRESP>> => api.post(ENDPOINT.ROOT, body);

export const updateMemberAPI = (body: MemberBasicInfoUpdateREQ) => api.put(`${ENDPOINT.ROOT}/${body.member_id}`, body);

export const getMemberPermissionsAPI = (id: number): Promise<BaseRESP<MemberPermissionInfoRESP>> =>
  api.get(`${ENDPOINT.ROOT}/${id}/permissions`);

export const updateMemberPasswordAPI = (body: MemberPasswordUpdateREQ) =>
  api.post(`${ENDPOINT.ROOT}/${body.member_id}/change-password`, body);

export const getMemberActivityLogsAPI = (id: number, params?: MemberActivityLogsREQ): Promise<BaseRESP<MemberActivityLogsRESP>> =>
  api.get(`${ENDPOINT.ROOT}/${id}/activity-logs`, { params });

export const exportMemberExcelAPI = (body: MemberExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${ENDPOINT.ROOT}/export-excel`, body);

export const getMemberExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/check-progress-status`);

export const downloadMemberExportAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.ROOT}/export-excel/${historyId}/download`, { responseType: 'blob' });
