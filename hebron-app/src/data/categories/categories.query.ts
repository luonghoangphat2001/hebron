import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { categoriesAPI } from './categories.api';
import type { CategoryListREQ } from './categories.request';
import type { CategoryListRESP } from './categories.response';

export const CATEGORY_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (params?: CategoryListREQ) => [...CATEGORY_QUERY_KEYS.lists(), params] as const,
  childrenList: (slug?: string) => [...CATEGORY_QUERY_KEYS.all, 'children', slug] as const,
};

export const useCategoriesQuery = (
  params?: CategoryListREQ,
  options?: Omit<UseQueryOptions<BaseRESP<CategoryListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(params),
    queryFn: () => categoriesAPI.getList(params),
    ...options,
  });

export const useCategoryChildrenQuery = (slug?: string) =>
  useQuery({
    queryKey: CATEGORY_QUERY_KEYS.childrenList(slug),
    queryFn: () => categoriesAPI.getChildren(slug as string),
    select: (resp) => resp.data,
    enabled: !!slug,
  });
