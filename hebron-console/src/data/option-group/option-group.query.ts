import { PICKER_PAGE_SIZE } from '@/utils/constants/common.constant';
import { getNextPageParam } from '@/utils/helper/common.helper';
import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  assignOptionGroupProductsAPI,
  createOptionGroupAPI,
  deleteOptionGroupAPI,
  getOptionGroupDetailAPI,
  getOptionGroupListAPI,
  updateOptionGroupAPI,
} from './option-group.api';
import type {
  OptionGroupAssignProductsREQ,
  OptionGroupCreateREQ,
  OptionGroupListREQ,
  OptionGroupUpdateREQ,
} from './option-group.request';
import type { ProductOptionGroupsDetailRESP, ProductOptionGroupsListRESP } from './option-group.response';

export const OPTION_GROUP_QUERY_KEYS = {
  LIST: 'OPTION_GROUP_LIST',
  INFINITE: 'OPTION_GROUP_INFINITE',
  DETAIL: 'OPTION_GROUP_DETAIL',
  EXPORT_PROGRESS: 'OPTION_GROUP_EXPORT_PROGRESS',
};

export const useOptionGroupListQuery = (params: OptionGroupListREQ) =>
  useQuery({
    queryKey: [OPTION_GROUP_QUERY_KEYS.LIST, params],
    queryFn: () => getOptionGroupListAPI(params),
    select: (resp: BaseRESP<ProductOptionGroupsListRESP>) => ({
      list: resp.data.product_option_groups,
      pagination: resp.data.pagination,
    }),
  });

export const useOptionGroupInfiniteQuery = (
  params?: Omit<OptionGroupListREQ, 'page'>,
  options?: { refetchOnWindowFocus?: boolean },
) =>
  useInfiniteQuery({
    ...options,
    queryKey: [OPTION_GROUP_QUERY_KEYS.INFINITE, params],
    queryFn: ({ pageParam }) => getOptionGroupListAPI({ per_page: PICKER_PAGE_SIZE, ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => getNextPageParam(lastPage.data.pagination),
    select: (data) => data.pages.flatMap((page) => page.data.product_option_groups),
  });

export const useOptionGroupDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [OPTION_GROUP_QUERY_KEYS.DETAIL, id],
    queryFn: () => getOptionGroupDetailAPI(id as number),
    select: (resp) => resp.data.product_option_group,
    enabled: !!id,
  });

export const useOptionGroupCreateMutation = (
  options?: UseMutationOptions<BaseRESP<ProductOptionGroupsDetailRESP>, AxiosError<ErrorRESP>, OptionGroupCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createOptionGroupAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [OPTION_GROUP_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useOptionGroupUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<ProductOptionGroupsDetailRESP>, AxiosError<ErrorRESP>, OptionGroupUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateOptionGroupAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [OPTION_GROUP_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [OPTION_GROUP_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useOptionGroupDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteOptionGroupAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [OPTION_GROUP_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useOptionGroupAssignProductsMutation = (
  options?: UseMutationOptions<BaseRESP<ProductOptionGroupsDetailRESP>, AxiosError<ErrorRESP>, OptionGroupAssignProductsREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: assignOptionGroupProductsAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [OPTION_GROUP_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};
