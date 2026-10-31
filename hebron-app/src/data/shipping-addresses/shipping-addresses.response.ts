import type { Pagination } from '@/utils/types/response.type';

export type ShippingAddressItemRESP = {
  id: number;
  recipient: string;
  phone: string;
  postcode: string;
  address: string;
  detailed_address: string;
  delivery_message_preset: string | null;
  delivery_message_custom: string | null;
  is_default: boolean;
};

export type ShippingAddressListRESP = {
  addresses: ShippingAddressItemRESP[];
  pagination: Pagination;
};

export type ShippingAddressDetailRESP = {
  address: ShippingAddressItemRESP;
};
