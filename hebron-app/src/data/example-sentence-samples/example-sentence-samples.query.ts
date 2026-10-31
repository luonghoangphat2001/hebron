import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { keepPreviousData, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { exampleSentenceSamplesAPI } from './example-sentence-samples.api';
import type { ExampleSentenceSampleListREQ } from './example-sentence-samples.request';
import type {
  ExampleSentenceSampleCategoryListRESP,
  ExampleSentenceSampleDetailRESP,
  ExampleSentenceSampleListRESP,
} from './example-sentence-samples.response';

export const EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS = {
  all: ['example-sentence-samples'] as const,
  lists: () => [...EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.all, 'list'] as const,
  list: (params?: ExampleSentenceSampleListREQ) => [...EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.lists(), params] as const,
  categories: () => [...EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.all, 'categories'] as const,
  details: () => [...EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.details(), id] as const,
};

export const useExampleSentenceSamplesQuery = (
  params?: ExampleSentenceSampleListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<ExampleSentenceSampleListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.list(params),
    queryFn: () => exampleSentenceSamplesAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useExampleSentenceSampleCategoriesQuery = (
  options?: Omit<UseQueryOptions<BaseRESP<ExampleSentenceSampleCategoryListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.categories(),
    queryFn: () => exampleSentenceSamplesAPI.getCategories(),
    ...options,
  });

export const useExampleSentenceSampleDetailQuery = (
  id: number | string,
  options?: Omit<UseQueryOptions<BaseRESP<ExampleSentenceSampleDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: EXAMPLE_SENTENCE_SAMPLE_QUERY_KEYS.detail(id),
    queryFn: () => exampleSentenceSamplesAPI.getDetail(id),
    enabled: Boolean(id),
    ...options,
  });
