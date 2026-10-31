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
import { inquiriesAPI } from './inquiries.api';
import type { InquiryCreateREQ, InquiryListREQ, InquiryUpdateREQ } from './inquiries.request';
import type { InquiryDetailRESP, InquiryListRESP } from './inquiries.response';

export const INQUIRY_QUERY_KEYS = {
  all: ['inquiries'] as const,
  lists: () => [...INQUIRY_QUERY_KEYS.all, 'list'] as const,
  list: (params?: InquiryListREQ) => [...INQUIRY_QUERY_KEYS.lists(), params] as const,
  details: () => [...INQUIRY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...INQUIRY_QUERY_KEYS.details(), id] as const,
};

export const useInquiriesQuery = (
  params?: InquiryListREQ,
  options?: Omit<UseQueryOptions<PaginationRESP<InquiryListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: INQUIRY_QUERY_KEYS.list(params),
    queryFn: () => inquiriesAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useInquiryDetailQuery = (
  id: number | string,
  options?: Omit<UseQueryOptions<BaseRESP<InquiryDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: INQUIRY_QUERY_KEYS.detail(id),
    queryFn: () => inquiriesAPI.getDetail(id),
    enabled: Boolean(id),
    ...options,
  });

export const useCreateInquiryMutation = (
  options?: UseMutationOptions<BaseRESP<InquiryDetailRESP>, AxiosError<ErrorRESP>, InquiryCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: inquiriesAPI.create,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: INQUIRY_QUERY_KEYS.lists() });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateInquiryMutation = (
  options?: UseMutationOptions<
    BaseRESP<InquiryDetailRESP>,
    AxiosError<ErrorRESP>,
    { id: number | string; body: InquiryUpdateREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => inquiriesAPI.update(id, body),
    onSuccess: (data, variables, ...rest) => {
      void queryClient.invalidateQueries({ queryKey: INQUIRY_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: INQUIRY_QUERY_KEYS.detail(variables.id) });
      options?.onSuccess?.(data, variables, ...rest);
    },
  });
};

export const useDeleteInquiryMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number | string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: inquiriesAPI.remove,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: INQUIRY_QUERY_KEYS.lists() });
      options?.onSuccess?.(...args);
    },
  });
};
