import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { MesLogListREQ } from './mes.request';
import type { MesIntegrationStatusRESP, MesLogDetailRESP, MesLogListRESP } from './mes.response';

const ENDPOINT = {
  ROOT: '/admin/mes-integration-logs',
};

export const getMesLogListAPI = (params: MesLogListREQ): Promise<PaginationRESP<MesLogListRESP>> =>
  api.get(ENDPOINT.ROOT, { params });

export const getMesLogDetailAPI = (id: number | string): Promise<BaseRESP<MesLogDetailRESP>> => api.get(`${ENDPOINT.ROOT}/${id}`);

export const getMesIntegrationStatusAPI = (): Promise<BaseRESP<MesIntegrationStatusRESP>> =>
  api.get(`${ENDPOINT.ROOT}/dashboard`);
