import { SAMPLE_CATEGORY_PICKER_PAGE_SIZE } from './example-sentence-sample.service';
import { getNextPageParam } from '@/utils/helper/common.helper';
import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createExampleSentenceSampleCategoryAPI,
  createExampleSentenceSampleAPI,
  deleteExampleSentenceSampleCategoryAPI,
  deleteExampleSentenceSampleAPI,
  getExampleSentenceSampleCategoryDetailAPI,
  getExampleSentenceSampleCategoryListAPI,
  getExampleSentenceSampleDetailAPI,
  getExampleSentenceSampleListAPI,
  updateExampleSentenceSampleAPI,
  updateExampleSentenceSampleCategoryAPI,
} from './example-sentence-sample.api';
import type {
  ExampleSentenceSampleCategoryUpdateREQ,
  ExampleSentenceSampleCategoryUpsertREQ,
  ExampleSentenceSampleCategoryListREQ,
  ExampleSentenceSampleListREQ,
  ExampleSentenceSampleUpdateREQ,
  ExampleSentenceSampleUpsertREQ,
} from './example-sentence-sample.request';
import type {
  ExampleSentenceSampleCategoryDetailRESP,
  ExampleSentenceSampleCategoryListRESP,
  ExampleSentenceSampleDetailRESP,
  ExampleSentenceSampleListRESP,
} from './example-sentence-sample.response';

export const EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS = {
  LIST: 'EXAMPLE_SENTENCE_SAMPLE_LIST',
  DETAIL: 'EXAMPLE_SENTENCE_SAMPLE_DETAIL',
  CATEGORY_LIST: 'EXAMPLE_SENTENCE_SAMPLE_CATEGORY_LIST',
  CATEGORY_DETAIL: 'EXAMPLE_SENTENCE_SAMPLE_CATEGORY_DETAIL',
};

export const useExampleSentenceSampleListQuery = (params: ExampleSentenceSampleListREQ) =>
  useQuery({
    queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.LIST, params],
    queryFn: () => getExampleSentenceSampleListAPI(params),
    select: (resp: PaginationRESP<ExampleSentenceSampleListRESP>) => ({
      list: resp.data.example_sentence_samples,
      pagination: resp.pagination,
    }),
  });

export const useExampleSentenceSampleDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.DETAIL, id],
    queryFn: () => getExampleSentenceSampleDetailAPI(id as number),
    select: (resp) => resp.data.example_sentence_sample,
    enabled: !!id,
  });

export const useExampleSentenceSampleCreateMutation = (
  options?: UseMutationOptions<BaseRESP<ExampleSentenceSampleDetailRESP>, AxiosError<ErrorRESP>, ExampleSentenceSampleUpsertREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createExampleSentenceSampleAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useExampleSentenceSampleUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<ExampleSentenceSampleDetailRESP>, AxiosError<ErrorRESP>, ExampleSentenceSampleUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateExampleSentenceSampleAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.DETAIL] });
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useExampleSentenceSampleDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteExampleSentenceSampleAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useExampleSentenceSampleCategoryListQuery = (params: ExampleSentenceSampleCategoryListREQ) =>
  useQuery({
    queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST, params],
    queryFn: () => getExampleSentenceSampleCategoryListAPI(params),
    select: (resp: PaginationRESP<ExampleSentenceSampleCategoryListRESP>) => ({
      list: resp.data.categories,
      pagination: resp.pagination,
    }),
  });

export const useExampleSentenceSampleCategoryInfiniteQuery = (
  params?: Omit<ExampleSentenceSampleCategoryListREQ, 'page' | 'per_page'>,
) =>
  useInfiniteQuery({
    queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST, 'infinite', params],
    queryFn: ({ pageParam }) =>
      getExampleSentenceSampleCategoryListAPI({
        ...params,
        page: pageParam as number,
        per_page: SAMPLE_CATEGORY_PICKER_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.pagination),
    select: (data) => ({
      categories: data.pages.flatMap((page) => page.data.categories),
      total: data.pages[0]?.pagination.total_item ?? 0,
    }),
  });

export const useExampleSentenceSampleCategoryDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_DETAIL, id],
    queryFn: () => getExampleSentenceSampleCategoryDetailAPI(id as number),
    select: (resp) => resp.data.category,
    enabled: !!id,
  });

export const useExampleSentenceSampleCategoryCreateMutation = (
  options?: UseMutationOptions<
    BaseRESP<ExampleSentenceSampleCategoryDetailRESP>,
    AxiosError<ErrorRESP>,
    ExampleSentenceSampleCategoryUpsertREQ
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createExampleSentenceSampleCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useExampleSentenceSampleCategoryUpdateMutation = (
  options?: UseMutationOptions<
    BaseRESP<ExampleSentenceSampleCategoryDetailRESP>,
    AxiosError<ErrorRESP>,
    ExampleSentenceSampleCategoryUpdateREQ
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateExampleSentenceSampleCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST] });
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useExampleSentenceSampleCategoryDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteExampleSentenceSampleCategoryAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.CATEGORY_LIST] });
      queryClient.invalidateQueries({ queryKey: [EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
