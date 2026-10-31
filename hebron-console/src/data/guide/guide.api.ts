import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { GuideCreateREQ, GuideListREQ, GuideUpdateREQ } from './guide.request';
import type { GuideCreateRESP, GuideDetailRESP, GuideListRESP } from './guide.response';

export const getGuideListAPI = (params: GuideListREQ): Promise<PaginationRESP<GuideListRESP>> =>
  api.get('/admin/guide-contents', { params });

export const getGuideDetailAPI = (id: number): Promise<BaseRESP<GuideDetailRESP>> => api.get(`/admin/guide-contents/${id}`);

export const createGuideAPI = (body: GuideCreateREQ): Promise<BaseRESP<GuideCreateRESP>> =>
  api.post('/admin/guide-contents', body);

export const updateGuideAPI = ({ id, ...body }: GuideUpdateREQ): Promise<BaseRESP<GuideCreateRESP>> =>
  api.put(`/admin/guide-contents/${id}`, body);

export const deleteGuideAPI = (id: number): Promise<BaseRESP<Record<string, never>>> => api.delete(`/admin/guide-contents/${id}`);
