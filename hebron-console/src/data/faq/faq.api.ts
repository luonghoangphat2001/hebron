import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { FAQCategoryListREQ, FAQCategoryUpsertREQ, FAQCreateREQ, FAQListREQ, FAQUpdateREQ } from './faq.request';
import type { FAQCategoryDetailRESP, FAQCategoryListRESP, FAQCreateRESP, FAQDetailRESP, FAQListRESP } from './faq.response';

const ENDPOINTS = {
  ROOT: '/admin/faq',
  CATEGORY: '/admin/faqs/category',
};

export const getFAQListAPI = (params: FAQListREQ): Promise<PaginationRESP<FAQListRESP>> => api.get(ENDPOINTS.ROOT, { params });

export const getFAQDetailAPI = (id: number): Promise<BaseRESP<FAQDetailRESP>> => api.get(`${ENDPOINTS.ROOT}/${id}`);

export const createFAQAPI = (body: FAQCreateREQ): Promise<BaseRESP<FAQCreateRESP>> => api.post(ENDPOINTS.ROOT, body);

export const updateFAQAPI = ({ id, ...body }: FAQUpdateREQ): Promise<BaseRESP<FAQCreateRESP>> =>
  api.put(`${ENDPOINTS.ROOT}/${id}`, body);

export const deleteFAQAPI = (id: number): Promise<BaseRESP<Record<string, never>>> => api.delete(`${ENDPOINTS.ROOT}/${id}`);

export const getFAQCategoryListAPI = (params?: FAQCategoryListREQ): Promise<BaseRESP<FAQCategoryListRESP>> =>
  api.get(ENDPOINTS.CATEGORY, { params });

export const createFAQCategoryAPI = (body: FAQCategoryUpsertREQ): Promise<BaseRESP<FAQCategoryDetailRESP>> =>
  api.post(ENDPOINTS.CATEGORY, body);

export const updateFAQCategoryAPI = (id: number | string, body: FAQCategoryUpsertREQ): Promise<BaseRESP<FAQCategoryDetailRESP>> =>
  api.put(`${ENDPOINTS.CATEGORY}/${id}`, body);

export const deleteFAQCategoryAPI = (id: number | string): Promise<BaseRESP<null>> => api.delete(`${ENDPOINTS.CATEGORY}/${id}`);
