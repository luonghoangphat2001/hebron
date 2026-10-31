import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { ShippingAddressDeleteREQ, ShippingAddressListREQ, ShippingAddressUpsertREQ } from './shipping-addresses.request';
import type { ShippingAddressDetailRESP, ShippingAddressListRESP } from './shipping-addresses.response';

const ENDPOINTS = {
  LIST: '/mypage/shipping-addresses',
  DETAIL: (id: number | string) => `/mypage/shipping-addresses/${id}`,
} as const;

export const shippingAddressesAPI = {
  getList: (params?: ShippingAddressListREQ): Promise<BaseRESP<ShippingAddressListRESP>> => api.get(ENDPOINTS.LIST, { params }),

  getDetail: (id: number | string): Promise<BaseRESP<ShippingAddressDetailRESP>> => api.get(ENDPOINTS.DETAIL(id)),

  create: (body: ShippingAddressUpsertREQ): Promise<BaseRESP<ShippingAddressDetailRESP>> => api.post(ENDPOINTS.LIST, body),

  update: (id: number | string, body: ShippingAddressUpsertREQ): Promise<BaseRESP<ShippingAddressDetailRESP>> =>
    api.put(ENDPOINTS.DETAIL(id), body),

  remove: (body: ShippingAddressDeleteREQ): Promise<BaseRESP<null>> => api.delete(ENDPOINTS.LIST, { data: body }),
};
