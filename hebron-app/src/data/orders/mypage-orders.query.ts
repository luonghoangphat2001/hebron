import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { keepPreviousData, useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { myPageOrdersAPI } from './mypage-orders.api';
import type { MyPageOrderHistoryDetailRESP, MyPageOrderHistoryListRESP } from './mypage-orders.response';
import type { MyPageOrderHistoryListREQ } from './orders.request';

export const MY_PAGE_ORDER_QUERY_KEYS = {
  all: ['my-page-orders'] as const,
  lists: () => [...MY_PAGE_ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: MyPageOrderHistoryListREQ) => [...MY_PAGE_ORDER_QUERY_KEYS.lists(), params] as const,
  details: () => [...MY_PAGE_ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (orderNumber: string) => [...MY_PAGE_ORDER_QUERY_KEYS.details(), orderNumber] as const,
  exportProgresses: () => [...MY_PAGE_ORDER_QUERY_KEYS.all, 'export-progress'] as const,
};

export const useMyPageOrdersQuery = (
  params?: MyPageOrderHistoryListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<MyPageOrderHistoryListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: MY_PAGE_ORDER_QUERY_KEYS.list(params),
    queryFn: () => myPageOrdersAPI.getList(params),
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
    ...options,
  });

export const useMyPageOrderDetailQuery = (
  orderNumber: string,
  options?: Omit<UseQueryOptions<BaseRESP<MyPageOrderHistoryDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: MY_PAGE_ORDER_QUERY_KEYS.detail(orderNumber),
    queryFn: () => myPageOrdersAPI.getDetail(orderNumber),
    enabled: Boolean(orderNumber),
    refetchInterval: 15000,
    ...options,
  });

export const useDownloadQuotationPdfMutation = (options?: UseMutationOptions<Blob, AxiosError<ErrorRESP>, string>) =>
  useMutation({
    ...options,
    mutationFn: myPageOrdersAPI.downloadQuotationPdf,
  });

export const useDownloadTransactionPdfMutation = (options?: UseMutationOptions<Blob, AxiosError<ErrorRESP>, string>) =>
  useMutation({
    ...options,
    mutationFn: myPageOrdersAPI.downloadTransactionPdf,
  });
