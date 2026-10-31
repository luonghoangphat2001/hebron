import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { BrandProductionInquiryCreateREQ } from './brand-production-inquiry.request';
import type { BrandProductionInquiryCreateRESP } from './brand-production-inquiry.response';

const ENDPOINTS = {
  CREATE: '/brand/production-inquiry',
} as const;

export const brandProductionInquiryAPI = {
  create: (body: BrandProductionInquiryCreateREQ): Promise<BaseRESP<BrandProductionInquiryCreateRESP>> =>
    api.post(ENDPOINTS.CREATE, body),
};
