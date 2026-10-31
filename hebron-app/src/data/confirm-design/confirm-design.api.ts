import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { ConfirmDesignREQ } from './confirm-design.request';
import type { ConfirmDesignRESP } from './confirm-design.response';

const ENDPOINTS = {
  ACTION: (slug: string) => `/orders/design-revisions/${slug}/action`,
  DETAIL: (slug: string) => `/orders/design-revisions/${slug}`,
} as const;

export const confirmDesignAPI = {
  sendConfirm: (body: ConfirmDesignREQ) => api.post(ENDPOINTS.ACTION(body.slug), body),

  getDetailInfo: (slug: string): Promise<BaseRESP<ConfirmDesignRESP>> => api.get(ENDPOINTS.DETAIL(slug)),
};
