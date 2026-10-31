import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { PopupCreateREQ, PopupListREQ, PopupUpdateREQ } from './popup.request';
import type { PopupList, PopupRESP } from './popup.response';

const ENDPOINTS = {
  ROOT: `/admin/popups`,
};

export const getPopupListAPI = (params: PopupListREQ): Promise<PaginationRESP<PopupList>> => api.get(ENDPOINTS.ROOT, { params });

export const getPopupDetailAPI = (id: number): Promise<BaseRESP<PopupRESP>> => api.get(`${ENDPOINTS.ROOT}/${id}`);

export const createPopupAPI = (body: PopupCreateREQ) => api.post(ENDPOINTS.ROOT, body);

export const updatePopupAPI = (body: PopupUpdateREQ) => api.put(`${ENDPOINTS.ROOT}/${body.id}`, body);

export const deletePopupAPI = (id: number): Promise<BaseRESP<Record<string, never>>> => api.delete(`${ENDPOINTS.ROOT}/${id}`);
