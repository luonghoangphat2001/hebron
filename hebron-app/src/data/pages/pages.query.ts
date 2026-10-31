import type { SiteType } from '@/utils/enums/common.enum';
import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { pagesAPI } from './pages.api';
import type { PageDetailRESP } from './pages.response';

export const PAGE_QUERY_KEYS = {
  all: ['pages'] as const,
  details: () => [...PAGE_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string, params?: { site_type?: SiteType | string }) => [...PAGE_QUERY_KEYS.details(), slug, params] as const,
};

export const usePageBySlugQuery = (
  slug: string,
  params?: { site_type?: SiteType | string },
  options?: Omit<UseQueryOptions<BaseRESP<PageDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: PAGE_QUERY_KEYS.detail(slug, params),
    queryFn: () => pagesAPI.getBySlug(slug, params),
    enabled: Boolean(slug),
    ...options,
  });
