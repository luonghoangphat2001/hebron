import { api } from '@/api';
import type { ExportExcelRESP } from '@/utils/types/export.type';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { AccessLogListREQ, TaskLogExportExcelREQ, TaskLogListREQ } from './system.request';
import type { AccessLogDataRESP, TaskLogDataRESP } from './system.response';

const ENDPOINT = {
  TASK_LOGS: '/admin/task-logs',
  ACCESS_LOGS: '/admin/access-logs',
};

export const getTaskLogListAPI = (params?: TaskLogListREQ): Promise<PaginationRESP<TaskLogDataRESP>> =>
  api.get(ENDPOINT.TASK_LOGS, { params });

export const getAccessLogListAPI = (params?: AccessLogListREQ): Promise<PaginationRESP<AccessLogDataRESP>> =>
  api.get(ENDPOINT.ACCESS_LOGS, { params });

export const exportTaskLogExcelAPI = (body: TaskLogExportExcelREQ): Promise<BaseRESP<ExportExcelRESP>> =>
  api.post(`${ENDPOINT.TASK_LOGS}/export-excel`, body);

export const getTaskLogExportProgressAPI = (historyId: number): Promise<BaseRESP<ExportExcelRESP>> =>
  api.get(`${ENDPOINT.TASK_LOGS}/export-excel/${historyId}/check-progress-status`);

export const downloadTaskLogExportAPI = (historyId: number): Promise<Blob> =>
  api.get(`${ENDPOINT.TASK_LOGS}/export-excel/${historyId}/download`, { responseType: 'blob' });
