import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { mediaAPI } from './media.api';
import type { MediaListREQ } from './media.request';
import type { MediaDetailRESP, MediaListRESP } from './media.response';

export type MediaListInfiniteParams = Omit<MediaListREQ, 'page'>;

export const MEDIA_QUERY_KEYS = {
  all: ['media'] as const,
  lists: () => [...MEDIA_QUERY_KEYS.all, 'list'] as const,
  list: (params?: MediaListInfiniteParams) => [...MEDIA_QUERY_KEYS.lists(), params] as const,
  categories: () => [...MEDIA_QUERY_KEYS.all, 'categories'] as const,
  byCategory: (categoryId: number | string) => [...MEDIA_QUERY_KEYS.lists(), 'category', categoryId] as const,
  detail: (id?: number) => [...MEDIA_QUERY_KEYS.all, 'detail', id] as const,
};

export const useMediaQuery = (
  params?: MediaListInfiniteParams,
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginationRESP<MediaListRESP>,
      AxiosError<ErrorRESP>,
      InfiniteData<PaginationRESP<MediaListRESP>>,
      ReturnType<typeof MEDIA_QUERY_KEYS.list>,
      number
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >,
) =>
  useInfiniteQuery({
    queryKey: MEDIA_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) => mediaAPI.getList({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // ponytail: optional chaining because /media may answer without a pagination block — then there is no next page.
      const currentPage = lastPage.pagination?.current_page ?? 1;
      const totalPage = lastPage.pagination?.total_page ?? 1;
      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
    ...options,
  });

export const useMediaByCategoryQuery = (
  categoryId: number | string,
  options?: Omit<UseQueryOptions<BaseRESP<MediaListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: MEDIA_QUERY_KEYS.byCategory(categoryId),
    queryFn: () => mediaAPI.getListByCategory(categoryId),
    enabled: Boolean(categoryId),
    ...options,
  });

export const useMediaCategoriesQuery = () =>
  useQuery({
    queryKey: MEDIA_QUERY_KEYS.categories(),
    queryFn: () => mediaAPI.getCategories(),
    select: (resp) => resp.data?.categories ?? [],
  });

export const useMediaDetailQuery = (
  id?: number,
  options?: Omit<UseQueryOptions<BaseRESP<MediaDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: MEDIA_QUERY_KEYS.detail(id),
    queryFn: () => mediaAPI.getDetail(id as number),
    enabled: Boolean(id),
    ...options,
  });
