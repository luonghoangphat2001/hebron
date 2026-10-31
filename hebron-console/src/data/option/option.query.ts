import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createOptionAPI, deleteOptionAPI, getOptionDetailAPI, getOptionListAPI, updateOptionAPI } from './option.api';
import type { OptionCreateREQ, OptionListREQ, OptionUpdateREQ } from './option.request';
import type { ProductOptionsDetailRESP, ProductOptionsListRESP } from './option.response';

export const OPTION_QUERY_KEYS = {
  LIST: 'OPTION_LIST',
  DETAIL: 'OPTION_DETAIL',
};

export const useOptionListQuery = (params: OptionListREQ) =>
  useQuery({
    queryKey: [OPTION_QUERY_KEYS.LIST, params],
    queryFn: () => getOptionListAPI(params),
    select: (resp: BaseRESP<ProductOptionsListRESP>) => ({
      list: resp.data.product_options,
      pagination: resp.data.pagination,
    }),
  });

export const useOptionDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [OPTION_QUERY_KEYS.DETAIL, id],
    queryFn: () => getOptionDetailAPI(id as number),
    select: (resp) => resp.data.product_option,
    enabled: !!id,
  });

export const useOptionCreateMutation = (
  options?: UseMutationOptions<BaseRESP<ProductOptionsDetailRESP>, AxiosError<ErrorRESP>, OptionCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createOptionAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [OPTION_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useOptionUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<ProductOptionsDetailRESP>, AxiosError<ErrorRESP>, OptionUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateOptionAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [OPTION_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [OPTION_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useOptionDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteOptionAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [OPTION_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
