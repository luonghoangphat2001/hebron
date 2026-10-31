import { api } from '@/api';
import type { BaseRESP, PaginationRESP } from '@/utils/types/response.type';
import type { OrderCreateREQ, OrderInquiryDetailREQ, OrderListREQ } from './orders.request';
import type { OrderDetailRESP, OrderInquiryDetailRESP, OrderListRESP } from './orders.response';

const ENDPOINTS = {
  LIST: '/orders',
  DETAIL: (orderNumber: string) => `/orders/${orderNumber}`,
  INQUIRY_DETAIL: '/inquiry/order-detail',
} as const;

export const ordersAPI = {
  getList: (params?: OrderListREQ): Promise<PaginationRESP<OrderListRESP>> => api.get(ENDPOINTS.LIST, { params }),

  getDetail: (orderNumber: string): Promise<BaseRESP<OrderDetailRESP>> => api.get(ENDPOINTS.DETAIL(orderNumber)),

  getInquiryDetail: (params: OrderInquiryDetailREQ): Promise<BaseRESP<OrderInquiryDetailRESP>> =>
    api.get(ENDPOINTS.INQUIRY_DETAIL, { params }),

  create: (body: OrderCreateREQ): Promise<BaseRESP<OrderDetailRESP>> => api.post(ENDPOINTS.LIST, body),
};
