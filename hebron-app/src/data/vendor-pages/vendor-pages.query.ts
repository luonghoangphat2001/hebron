import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { vendorPagesAPI } from './vendor-pages.api';
import type { VendorPageDetailRESP } from './vendor-pages.response';

export const VENDOR_PAGE_QUERY_KEYS = {
  all: ['vendor-pages'] as const,
  details: () => [...VENDOR_PAGE_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...VENDOR_PAGE_QUERY_KEYS.details(), slug] as const,
};

export const useVendorPageBySlugQuery = (
  slug: string,
  options?: Omit<UseQueryOptions<BaseRESP<VendorPageDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: VENDOR_PAGE_QUERY_KEYS.detail(slug),
    queryFn: () => vendorPagesAPI.getBySlug(slug),
    enabled: Boolean(slug),
    ...options,
  });
