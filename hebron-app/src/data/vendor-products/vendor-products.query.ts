import type { ProductDetailRESP } from '@/data/products/products.response';
import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { vendorProductsAPI } from './vendor-products.api';

export const VENDOR_PRODUCT_QUERY_KEYS = {
  all: ['vendor-products'] as const,
  details: () => [...VENDOR_PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...VENDOR_PRODUCT_QUERY_KEYS.details(), slug] as const,
};

export const useVendorProductDetailQuery = (
  slug: string,
  options?: Omit<UseQueryOptions<BaseRESP<ProductDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: VENDOR_PRODUCT_QUERY_KEYS.detail(slug),
    queryFn: () => vendorProductsAPI.getDetailBySlug({ slug }),
    enabled: Boolean(slug),
    ...options,
  });
