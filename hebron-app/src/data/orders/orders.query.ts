import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ordersAPI } from './orders.api';
import type { OrderCreateREQ, OrderInquiryDetailREQ, OrderListREQ } from './orders.request';
import type { OrderDetailRESP, OrderInquiryDetailRESP, OrderListRESP } from './orders.response';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: OrderListREQ) => [...ORDER_QUERY_KEYS.lists(), params] as const,
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (orderNumber: string) => [...ORDER_QUERY_KEYS.details(), orderNumber] as const,
  inquiryDetails: () => [...ORDER_QUERY_KEYS.all, 'inquiry-detail'] as const,
  inquiryDetail: (params: OrderInquiryDetailREQ) => [...ORDER_QUERY_KEYS.inquiryDetails(), params] as const,
};

export const useOrdersQuery = (
  params?: OrderListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<OrderListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: ORDER_QUERY_KEYS.list(params),
    queryFn: () => ordersAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useOrderDetailQuery = (
  orderNumber: string,
  options?: Omit<UseQueryOptions<BaseRESP<OrderDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderNumber),
    queryFn: () => ordersAPI.getDetail(orderNumber),
    enabled: Boolean(orderNumber),
    ...options,
  });

export const useCreateOrderMutation = (
  options?: UseMutationOptions<BaseRESP<OrderDetailRESP>, AxiosError<ErrorRESP>, OrderCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ordersAPI.create,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
      options?.onSuccess?.(...args);
    },
  });
};

export const useOrderInquiryDetailMutation = (
  options?: UseMutationOptions<BaseRESP<OrderInquiryDetailRESP>, AxiosError<ErrorRESP>, OrderInquiryDetailREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: ordersAPI.getInquiryDetail,
  });
