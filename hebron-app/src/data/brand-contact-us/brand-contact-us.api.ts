import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { BrandContactUsCreateREQ } from './brand-contact-us.request';
import type { BrandContactUsCreateRESP } from './brand-contact-us.response';

const ENDPOINTS = {
  CREATE: '/brand/contact-us',
} as const;

export const brandContactUsAPI = {
  create: (body: BrandContactUsCreateREQ): Promise<BaseRESP<BrandContactUsCreateRESP>> => api.post(ENDPOINTS.CREATE, body),
};
