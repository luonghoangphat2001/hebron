import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { CraftsmanshipCreateREQ, CraftsmanshipListREQ, CraftsmanshipUpdateREQ } from './craftsmanship.request';
import type { CraftsmanshipDetailRESP, CraftsmanshipListRESP } from './craftsmanship.response';

const ENDPOINTS = {
  ROOT: `/admin/craftsmanship-values`,
};

export const getCraftsmanshipListAPI = (params?: CraftsmanshipListREQ): Promise<PaginationRESP<CraftsmanshipListRESP>> =>
  api.get(ENDPOINTS.ROOT, { params });

export const getCraftsmanshipDetailAPI = (id: number | string): Promise<BaseRESP<CraftsmanshipDetailRESP>> =>
  api.get(`${ENDPOINTS.ROOT}/${id}`);

export const createCraftsmanshipAPI = (body: CraftsmanshipCreateREQ): Promise<BaseRESP<CraftsmanshipDetailRESP>> =>
  api.post(ENDPOINTS.ROOT, body);

export const updateCraftsmanshipAPI = (
  id: number | string,
  body: CraftsmanshipUpdateREQ,
): Promise<BaseRESP<CraftsmanshipDetailRESP>> => api.put(`${ENDPOINTS.ROOT}/${id}`, body);

export const deleteCraftsmanshipAPI = (id: number | string): Promise<BaseRESP<null>> => api.delete(`${ENDPOINTS.ROOT}/${id}`);
