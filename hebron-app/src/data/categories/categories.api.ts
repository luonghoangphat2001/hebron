import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { CategoryListREQ } from './categories.request';
import type { CategoryListRESP, CategoryRESP } from './categories.response';

const ENDPOINTS = {
  LIST: '/categories',
  GET_CHILDREN: (slug: string) => `/categories/${slug}/children`,
} as const;

export const categoriesAPI = {
  getList: (params?: CategoryListREQ): Promise<BaseRESP<CategoryListRESP>> => api.get(ENDPOINTS.LIST, { params }),

  getChildren: (slug: string): Promise<BaseRESP<CategoryRESP[]>> => api.get(ENDPOINTS.GET_CHILDREN(slug)),
};
