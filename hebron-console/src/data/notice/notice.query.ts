import { PICKER_PAGE_SIZE } from '@/utils/constants/common.constant';
import { getNextPageParam } from '@/utils/helper/common.helper';
import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createNoticeAPI,
  createNoticeCategoryAPI,
  deleteNoticeAPI,
  deleteNoticeCategoryAPI,
  getNoticeCategoryListAPI,
  getNoticeDetailAPI,
  getNoticeListAPI,
  updateNoticeAPI,
  updateNoticeCategoryAPI,
} from './notice.api';
import type {
  NoticeCategoryListREQ,
  NoticeCategoryUpsertREQ,
  NoticeCreateREQ,
  NoticeListREQ,
  NoticeUpdateREQ,
} from './notice.request';
import type { NoticeCategoryDetailRESP, NoticeCreateRESP, NoticeListRESP } from './notice.response';

export const NOTICE_QUERY_KEYS = {
  LIST: 'NOTICE_LIST',
  INFINITE: 'NOTICE_INFINITE',
  DETAIL: 'NOTICE_DETAIL',
  CATEGORY_LIST: 'NOTICE_CATEGORY_LIST',
};

export const useNoticeListQuery = (params: NoticeListREQ) =>
  useQuery({
    queryKey: [NOTICE_QUERY_KEYS.LIST, params],
    queryFn: () => getNoticeListAPI(params),
    select: (resp: PaginationRESP<NoticeListRESP>) => ({
      list: resp.data.notices,
      pagination: resp.pagination,
    }),
  });

export const useNoticeInfiniteQuery = (params?: Omit<NoticeListREQ, 'page'>) =>
  useInfiniteQuery({
    queryKey: [NOTICE_QUERY_KEYS.INFINITE, params],
    queryFn: ({ pageParam = 1 }) =>
      getNoticeListAPI({
        per_page: PICKER_PAGE_SIZE,
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination),
    select: (data) => ({
      pages: data.pages,
      notices: data.pages.flatMap((page) => page.data.notices),
      total: data.pages[0]?.pagination?.total_item ?? 0,
    }),
  });

export const useNoticeDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [NOTICE_QUERY_KEYS.DETAIL, id],
    queryFn: () => getNoticeDetailAPI(id as number),
    select: (resp) => resp.data.notice,
    enabled: !!id,
  });

export const useNoticeCreateMutation = (
  options?: UseMutationOptions<BaseRESP<NoticeCreateRESP>, AxiosError<ErrorRESP>, NoticeCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createNoticeAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [NOTICE_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useNoticeUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<NoticeCreateRESP>, AxiosError<ErrorRESP>, NoticeUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateNoticeAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [NOTICE_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [NOTICE_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useNoticeDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteNoticeAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [NOTICE_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useNoticeCategoryListQuery = (params?: NoticeCategoryListREQ) =>
  useQuery({
    queryKey: [NOTICE_QUERY_KEYS.CATEGORY_LIST, params],
    queryFn: () => getNoticeCategoryListAPI(params),
    select: (resp) => resp.data.categories,
  });

export const useNoticeCategoryCreateMutation = (
  options?: UseMutationOptions<BaseRESP<NoticeCategoryDetailRESP>, AxiosError<ErrorRESP>, NoticeCategoryUpsertREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createNoticeCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [NOTICE_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useNoticeCategoryUpdateMutation = (
  options?: UseMutationOptions<
    BaseRESP<NoticeCategoryDetailRESP>,
    AxiosError<ErrorRESP>,
    { id: number | string; body: NoticeCategoryUpsertREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => updateNoticeCategoryAPI(id, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [NOTICE_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useNoticeCategoryDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number | string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteNoticeCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [NOTICE_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
