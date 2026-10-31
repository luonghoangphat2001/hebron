import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { shippingAddressesAPI } from './shipping-addresses.api';
import type { ShippingAddressListREQ, ShippingAddressUpsertREQ, ShippingAddressDeleteREQ } from './shipping-addresses.request';
import type { ShippingAddressDetailRESP, ShippingAddressListRESP } from './shipping-addresses.response';

export const SHIPPING_ADDRESS_QUERY_KEYS = {
  all: ['shipping-addresses'] as const,
  lists: () => [...SHIPPING_ADDRESS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: ShippingAddressListREQ) => [...SHIPPING_ADDRESS_QUERY_KEYS.lists(), params] as const,
  details: () => [...SHIPPING_ADDRESS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...SHIPPING_ADDRESS_QUERY_KEYS.details(), id] as const,
};

export const useShippingAddressesQuery = (
  params?: ShippingAddressListREQ,
  options?: Omit<UseQueryOptions<BaseRESP<ShippingAddressListRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: SHIPPING_ADDRESS_QUERY_KEYS.list(params),
    queryFn: () => shippingAddressesAPI.getList(params),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useShippingAddressDetailQuery = (
  id: number | string,
  options?: Omit<UseQueryOptions<BaseRESP<ShippingAddressDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: SHIPPING_ADDRESS_QUERY_KEYS.detail(id),
    queryFn: () => shippingAddressesAPI.getDetail(id),
    enabled: Boolean(id),
    ...options,
  });

export const useCreateShippingAddressMutation = (
  options?: UseMutationOptions<BaseRESP<ShippingAddressDetailRESP>, AxiosError<ErrorRESP>, ShippingAddressUpsertREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: shippingAddressesAPI.create,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHIPPING_ADDRESS_QUERY_KEYS.lists() });
      options?.onSuccess?.(...args);
    },
  });
};

export const useUpdateShippingAddressMutation = (
  options?: UseMutationOptions<
    BaseRESP<ShippingAddressDetailRESP>,
    AxiosError<ErrorRESP>,
    { id: number | string; body: ShippingAddressUpsertREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => shippingAddressesAPI.update(id, body),
    onSuccess: (data, variables, ...rest) => {
      void queryClient.invalidateQueries({ queryKey: SHIPPING_ADDRESS_QUERY_KEYS.lists() });
      void queryClient.invalidateQueries({ queryKey: SHIPPING_ADDRESS_QUERY_KEYS.detail(variables.id) });
      options?.onSuccess?.(data, variables, ...rest);
    },
  });
};

export const useDeleteShippingAddressMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, ShippingAddressDeleteREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: shippingAddressesAPI.remove,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHIPPING_ADDRESS_QUERY_KEYS.lists() });
      options?.onSuccess?.(...args);
    },
  });
};
