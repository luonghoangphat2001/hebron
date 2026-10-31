import { PICKER_PAGE_SIZE } from '@/utils/constants/common.constant';
import { getNextPageParam } from '@/utils/helper/common.helper';
import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createFAQAPI,
  createFAQCategoryAPI,
  deleteFAQAPI,
  deleteFAQCategoryAPI,
  getFAQCategoryListAPI,
  getFAQDetailAPI,
  getFAQListAPI,
  updateFAQAPI,
  updateFAQCategoryAPI,
} from './faq.api';
import type { FAQCategoryListREQ, FAQCategoryUpsertREQ, FAQCreateREQ, FAQListREQ, FAQUpdateREQ } from './faq.request';
import type { FAQCategoryDetailRESP, FAQCategoryItem, FAQCreateRESP, FAQListRESP } from './faq.response';

export const FAQ_QUERY_KEYS = {
  LIST: 'FAQ_LIST',
  INFINITE: 'FAQ_INFINITE',
  DETAIL: 'FAQ_DETAIL',
  CATEGORY_LIST: 'FAQ_CATEGORY_LIST',
};

export const useFAQListQuery = (params: FAQListREQ) =>
  useQuery({
    queryKey: [FAQ_QUERY_KEYS.LIST, params],
    queryFn: () => getFAQListAPI(params),
    select: (resp: PaginationRESP<FAQListRESP>) => ({
      list: resp.data.faqs,
      pagination: resp.pagination,
    }),
  });

export const useFAQInfiniteQuery = (params?: Omit<FAQListREQ, 'page'>) =>
  useInfiniteQuery({
    queryKey: [FAQ_QUERY_KEYS.INFINITE, params],
    queryFn: ({ pageParam = 1 }) =>
      getFAQListAPI({
        per_page: PICKER_PAGE_SIZE,
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination),
    select: (data) => ({
      pages: data.pages,
      faqs: data.pages.flatMap((page) => page.data.faqs),
      total: data.pages[0]?.pagination?.total_item ?? 0,
    }),
  });

export const useFAQDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [FAQ_QUERY_KEYS.DETAIL, id],
    queryFn: () => getFAQDetailAPI(id as number),
    select: (resp) => resp.data.faq,
    enabled: !!id,
  });

export const useFAQCreateMutation = (
  options?: UseMutationOptions<BaseRESP<FAQCreateRESP>, AxiosError<ErrorRESP>, FAQCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createFAQAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useFAQUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<FAQCreateRESP>, AxiosError<ErrorRESP>, FAQUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateFAQAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useFAQDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteFAQAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useFAQCategoryListQuery = (params?: FAQCategoryListREQ) =>
  useQuery({
    queryKey: [FAQ_QUERY_KEYS.CATEGORY_LIST, params],
    queryFn: () => getFAQCategoryListAPI(params),
    select: (resp): FAQCategoryItem[] =>
      Array.isArray(resp.data) ? (resp.data as FAQCategoryItem[]) : resp.data?.categories || [],
  });

export const useFAQCategoryCreateMutation = (
  options?: UseMutationOptions<BaseRESP<FAQCategoryDetailRESP>, AxiosError<ErrorRESP>, FAQCategoryUpsertREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createFAQCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useFAQCategoryUpdateMutation = (
  options?: UseMutationOptions<
    BaseRESP<FAQCategoryDetailRESP>,
    AxiosError<ErrorRESP>,
    { id: number | string; body: FAQCategoryUpsertREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => updateFAQCategoryAPI(id, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useFAQCategoryDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number | string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteFAQCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
