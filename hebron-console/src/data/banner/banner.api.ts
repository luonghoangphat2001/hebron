import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { BannerCreateREQ, BannerListREQ, BannerUpdateREQ, BannerUploadImageREQ } from './banner.request';
import type { BannerRESP, BannerList } from './banner.response';

const ENDPOINTS = {
  ROOT: `/admin/banners`,
};

export const getBannerListAPI = (params: BannerListREQ): Promise<PaginationRESP<BannerList>> =>
  api.get(ENDPOINTS.ROOT, { params });

export const createBannerAPI = (body: BannerCreateREQ) => api.post(ENDPOINTS.ROOT, body);

export const getBannerDetailAPI = (id: number): Promise<BaseRESP<BannerRESP>> => api.get(`${ENDPOINTS.ROOT}/${id}`);

export const updateBannerAPI = (body: BannerUpdateREQ) => api.put(`${ENDPOINTS.ROOT}/${body.id}`, body);

export const uploadBannerImageAPI = (body: BannerUploadImageREQ) => api.post(`${ENDPOINTS.ROOT}/upload-image`, body);

export const deleteBannerAPI = (id: number) => api.delete(`${ENDPOINTS.ROOT}/${id}`);
