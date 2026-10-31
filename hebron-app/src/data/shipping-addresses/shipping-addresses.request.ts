export const SHIPPING_ADDRESS_SEARCH_TYPE = {
  RECIPIENT: 'recipient',
  ADDRESS: 'address',
  PHONE: 'phone',
} as const;

export type ShippingAddressSearchType = (typeof SHIPPING_ADDRESS_SEARCH_TYPE)[keyof typeof SHIPPING_ADDRESS_SEARCH_TYPE];

export type ShippingAddressListREQ = {
  search?: string;
  search_type?: ShippingAddressSearchType;
  per_page?: number;
  page?: number;
};

export type ShippingAddressUpsertREQ = {
  recipient: string;
  phone: string;
  postcode: string;
  address: string;
  detailed_address?: string;
  delivery_message_preset?: string | null;
  delivery_message_custom?: string | null;
  is_default?: boolean;
};

export type ShippingAddressDeleteREQ = {
  ids: number[];
};
