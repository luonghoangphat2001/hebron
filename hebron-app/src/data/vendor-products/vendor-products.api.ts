import { api } from '@/api';
import type { ProductDetailRESP } from '@/data/products/products.response';
import type { BaseRESP } from '@/utils/types/response.type';

import type { VendorProductDetailREQ } from './vendor-products.request';

const ENDPOINTS = {
  DETAIL: (slug: string) => `vendor/products/${slug}`,
} as const;

export const vendorProductsAPI = {
  getDetailBySlug: ({ slug }: VendorProductDetailREQ): Promise<BaseRESP<ProductDetailRESP>> => api.get(ENDPOINTS.DETAIL(slug)),
};
