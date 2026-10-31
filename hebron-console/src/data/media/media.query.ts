import { PICKER_PAGE_SIZE } from '@/utils/constants/common.constant';
import { getNextPageParam } from '@/utils/helper/common.helper';
import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createMediaAPI,
  createMediaCategoryAPI,
  deleteMediaAPI,
  deleteMediaCategoryAPI,
  getMediaCategoryListAPI,
  getMediaDetailAPI,
  getMediaListAPI,
  updateMediaAPI,
  updateMediaCategoryAPI,
} from './media.api';
import type { MediaCategoryListREQ, MediaCategoryUpsertREQ, MediaCreateREQ, MediaListREQ, MediaUpdateREQ } from './media.request';
import type { MediaCategoryDetailRESP, MediaDetailRESP, MediaListRESP } from './media.response';

export const MEDIA_QUERY_KEYS = {
  LIST: 'MEDIA_LIST',
  INFINITE: 'MEDIA_INFINITE',
  DETAIL: 'MEDIA_DETAIL',
  CATEGORY_LIST: 'MEDIA_CATEGORY_LIST',
};

export const useMediaInfiniteQuery = (params?: Omit<MediaListREQ, 'page'>, enabled = true) =>
  useInfiniteQuery({
    enabled,
    queryKey: [MEDIA_QUERY_KEYS.INFINITE, params],
    queryFn: ({ pageParam = 1 }) =>
      getMediaListAPI({
        per_page: PICKER_PAGE_SIZE,
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination),
    select: (data) => ({
      pages: data.pages,
      media: data.pages.flatMap((page) => page.data.media),
      total: data.pages[0]?.pagination?.total_item ?? 0,
    }),
  });

export const useMediaListQuery = (params: MediaListREQ) =>
  useQuery({
    queryKey: [MEDIA_QUERY_KEYS.LIST, params],
    queryFn: () => getMediaListAPI(params),
    select: (resp: PaginationRESP<MediaListRESP>) => ({
      list: resp.data.media,
      pagination: resp.pagination,
    }),
  });

export const useMediaDetailQuery = (id?: number | string) =>
  useQuery({
    queryKey: [MEDIA_QUERY_KEYS.DETAIL, id],
    queryFn: () => getMediaDetailAPI(id as number | string),
    select: (resp) => resp.data?.media,
    enabled: !!id,
  });

export const useMediaCreateMutation = (
  options?: UseMutationOptions<BaseRESP<MediaDetailRESP>, AxiosError<ErrorRESP>, MediaCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createMediaAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useMediaUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<MediaDetailRESP>, AxiosError<ErrorRESP>, { id: number | string; body: MediaUpdateREQ }>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => updateMediaAPI(id, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useMediaDeleteMutation = (options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number | string>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteMediaAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useMediaCategoryListQuery = (params?: MediaCategoryListREQ) =>
  useQuery({
    queryKey: [MEDIA_QUERY_KEYS.CATEGORY_LIST, params],
    queryFn: () => getMediaCategoryListAPI(params),
    select: (resp) => resp.data?.categories || [],
  });

export const useMediaCategoryCreateMutation = (
  options?: UseMutationOptions<BaseRESP<MediaCategoryDetailRESP>, AxiosError<ErrorRESP>, MediaCategoryUpsertREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createMediaCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useMediaCategoryUpdateMutation = (
  options?: UseMutationOptions<
    BaseRESP<MediaCategoryDetailRESP>,
    AxiosError<ErrorRESP>,
    { id: number | string; body: MediaCategoryUpsertREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => updateMediaCategoryAPI(id, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.CATEGORY_LIST] });
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useMediaCategoryDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number | string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteMediaCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.CATEGORY_LIST] });
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
