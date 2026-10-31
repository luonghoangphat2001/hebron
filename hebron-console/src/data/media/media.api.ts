import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { MediaCategoryListREQ, MediaCategoryUpsertREQ, MediaCreateREQ, MediaListREQ, MediaUpdateREQ } from './media.request';
import type { MediaCategoryDetailRESP, MediaCategoryListRESP, MediaDetailRESP, MediaListRESP } from './media.response';

const ENDPOINTS = {
  ROOT: '/admin/media',
  CATEGORY: '/admin/media/category',
};

export const getMediaListAPI = (params?: MediaListREQ): Promise<PaginationRESP<MediaListRESP>> =>
  api.get(ENDPOINTS.ROOT, { params });

export const getMediaDetailAPI = (id: number | string): Promise<BaseRESP<MediaDetailRESP>> => api.get(`${ENDPOINTS.ROOT}/${id}`);

export const createMediaAPI = (body: MediaCreateREQ): Promise<BaseRESP<MediaDetailRESP>> => api.post(ENDPOINTS.ROOT, body);

export const updateMediaAPI = (id: number | string, body: MediaUpdateREQ): Promise<BaseRESP<MediaDetailRESP>> =>
  api.put(`${ENDPOINTS.ROOT}/${id}`, body);

export const deleteMediaAPI = (id: number | string): Promise<BaseRESP<null>> => api.delete(`${ENDPOINTS.ROOT}/${id}`);

export const getMediaCategoryListAPI = (params?: MediaCategoryListREQ): Promise<BaseRESP<MediaCategoryListRESP>> =>
  api.get(ENDPOINTS.CATEGORY, { params });

export const createMediaCategoryAPI = (body: MediaCategoryUpsertREQ): Promise<BaseRESP<MediaCategoryDetailRESP>> =>
  api.post(ENDPOINTS.CATEGORY, body);

export const updateMediaCategoryAPI = (
  id: number | string,
  body: MediaCategoryUpsertREQ,
): Promise<BaseRESP<MediaCategoryDetailRESP>> => api.put(`${ENDPOINTS.CATEGORY}/${id}`, body);

export const deleteMediaCategoryAPI = (id: number | string): Promise<BaseRESP<null>> => api.delete(`${ENDPOINTS.CATEGORY}/${id}`);
