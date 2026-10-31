import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { GetTemplatesREQ } from './templates.request';
import type { GetTemplateDetailRESP, GetTemplatesRESP } from './templates.response';

const ENDPOINTS = {
  LIST: '/templates',
  DETAIL: (id: number) => `/templates/${id}`,
} as const;

export const templatesAPI = {
  getList: (params?: GetTemplatesREQ): Promise<BaseRESP<GetTemplatesRESP>> => api.get(ENDPOINTS.LIST, { params }),
  getDetail: (id: number): Promise<BaseRESP<GetTemplateDetailRESP>> => api.get(ENDPOINTS.DETAIL(id)),
};
