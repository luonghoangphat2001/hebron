import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { AddressGeocodeREQ } from './address.request';
import type { AddressGeocodeRESP } from './address.response';

const ENDPOINTS = {
  GEOCODE: '/admin/addresses/geocode',
};

export const getAddressGeocodeAPI = (params: AddressGeocodeREQ): Promise<BaseRESP<AddressGeocodeRESP>> =>
  api.get(ENDPOINTS.GEOCODE, { params });
