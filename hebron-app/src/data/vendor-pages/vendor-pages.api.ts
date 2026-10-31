import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';

import type { VendorPageDetailRESP } from './vendor-pages.response';

const ENDPOINTS = {
  BY_SLUG: (slug: string) => `vendor/pages/${slug}`,
} as const;

export const vendorPagesAPI = {
  getBySlug: (slug: string): Promise<BaseRESP<VendorPageDetailRESP>> => api.get(ENDPOINTS.BY_SLUG(slug)),
};
