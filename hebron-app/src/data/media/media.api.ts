import { api } from '@/api';
import { SiteType } from '@/utils/enums/common.enum';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { MediaListREQ } from './media.request';
import type { MediaCategoryListRESP, MediaDetailRESP, MediaListRESP } from './media.response';

const ENDPOINTS = {
  LIST: '/media',
  CATEGORIES: '/media/category',
  LIST_BY_CATEGORY: (categoryId: number | string) => `/media/categories/${categoryId}`,
  DETAIL: (id: number) => `/media/${id}`,
} as const;

export const mediaAPI = {
  // site_type is always BRAND_SITE on this client, so it is not exposed to callers by default.
  getList: (params?: MediaListREQ): Promise<PaginationRESP<MediaListRESP>> =>
    api.get(ENDPOINTS.LIST, {
      params: { site_type: SiteType.BRAND_SITE, per_page: 20, ...params },
      paramsSerializer: { indexes: false },
    }),

  getCategories: (): Promise<BaseRESP<MediaCategoryListRESP>> => api.get(ENDPOINTS.CATEGORIES),

  getListByCategory: (categoryId: number | string): Promise<BaseRESP<MediaListRESP>> =>
    api.get(ENDPOINTS.LIST_BY_CATEGORY(categoryId)),

  getDetail: (id: number): Promise<BaseRESP<MediaDetailRESP>> => api.get(ENDPOINTS.DETAIL(id)),
};
