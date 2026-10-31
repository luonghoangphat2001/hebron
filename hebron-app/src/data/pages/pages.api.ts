import { api } from '@/api';
import type { SiteType } from '@/utils/enums/common.enum';
import type { BaseRESP } from '@/utils/types/response.type';

import type { PageDetailRESP } from './pages.response';

const ENDPOINTS = {
  PAGE: (slug: string) => `pages/${slug}`,
  BRAND_PAGE: (slug: string) => `brand/pages/${slug}`,
} as const;

export const pagesAPI = {
  getBySlug: (slug: string, params?: { site_type?: SiteType | string }): Promise<BaseRESP<PageDetailRESP>> => {
    if (params?.site_type) {
      return api.get(ENDPOINTS.PAGE(slug), { params });
    }
    return api.get(ENDPOINTS.BRAND_PAGE(slug));
  },
};
