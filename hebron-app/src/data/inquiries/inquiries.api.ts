import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { InquiryCreateREQ, InquiryListREQ, InquiryUpdateREQ } from './inquiries.request';
import type { InquiryDetailRESP, InquiryListRESP } from './inquiries.response';

const ENDPOINTS = {
  LIST: '/mypage/inquiries',
  DETAIL: (id: number | string) => `/mypage/inquiries/${id}`,
} as const;

export const inquiriesAPI = {
  getList: (params?: InquiryListREQ): Promise<PaginationRESP<InquiryListRESP>> => api.get(ENDPOINTS.LIST, { params }),
  getDetail: (id: number | string): Promise<BaseRESP<InquiryDetailRESP>> => api.get(ENDPOINTS.DETAIL(id)),
  create: (body: InquiryCreateREQ): Promise<BaseRESP<InquiryDetailRESP>> => api.post(ENDPOINTS.LIST, body),
  update: (id: number | string, body: InquiryUpdateREQ): Promise<BaseRESP<InquiryDetailRESP>> =>
    api.patch(ENDPOINTS.DETAIL(id), body),
  remove: (id: number | string): Promise<BaseRESP<null>> => api.delete(ENDPOINTS.DETAIL(id)),
};
