import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { keepPreviousData, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { faqsAPI } from './faqs.api';
import type { BrandFAQListREQ, FAQListREQ } from './faqs.request';
import type { FAQCategoryListRESP, FAQListRESP } from './faqs.response';

export const FAQ_QUERY_KEYS = {
  all: ['faqs'] as const,
  categories: () => [...FAQ_QUERY_KEYS.all, 'categories'] as const,
  lists: () => [...FAQ_QUERY_KEYS.all, 'list'] as const,
  list: (params?: FAQListREQ) => [...FAQ_QUERY_KEYS.lists(), params] as const,
  brandLists: () => [...FAQ_QUERY_KEYS.all, 'brand-list'] as const,
  brandList: (params?: BrandFAQListREQ) => [...FAQ_QUERY_KEYS.brandLists(), params] as const,
};

export const useFaqCategoriesQuery = (
  options?: Omit<UseQueryOptions<BaseRESP<FAQCategoryListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: FAQ_QUERY_KEYS.categories(),
    queryFn: () => faqsAPI.getCategories(),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useFaqsQuery = (
  params?: FAQListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<FAQListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: FAQ_QUERY_KEYS.list(params),
    queryFn: () => faqsAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useBrandFaqsQuery = (
  params?: BrandFAQListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<FAQListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: FAQ_QUERY_KEYS.brandList(params),
    queryFn: () => faqsAPI.getBrandList(params),
    placeholderData: keepPreviousData,
    ...options,
  });
