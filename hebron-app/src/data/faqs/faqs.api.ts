import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { BrandFAQListREQ, FAQListREQ } from './faqs.request';
import type { FAQCategoryListRESP, FAQListRESP } from './faqs.response';

const ENDPOINTS = {
  LIST: '/mypage/faqs',
  BRAND_LIST: '/brand/faqs',
  CATEGORIES: '/faqs/category',
} as const;

export const faqsAPI = {
  getList: (params?: FAQListREQ): Promise<PaginationRESP<FAQListRESP>> => api.get(ENDPOINTS.LIST, { params }),
  getBrandList: (params?: BrandFAQListREQ): Promise<PaginationRESP<FAQListRESP>> => api.get(ENDPOINTS.BRAND_LIST, { params }),
  getCategories: (): Promise<BaseRESP<FAQCategoryListRESP>> => api.get(ENDPOINTS.CATEGORIES),
};
