import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  createCraftsmanshipAPI,
  deleteCraftsmanshipAPI,
  getCraftsmanshipDetailAPI,
  getCraftsmanshipListAPI,
  updateCraftsmanshipAPI,
} from './craftsmanship.api';
import type { CraftsmanshipCreateREQ, CraftsmanshipListREQ, CraftsmanshipUpdateREQ } from './craftsmanship.request';
import type { CraftsmanshipDetailRESP, CraftsmanshipListRESP } from './craftsmanship.response';

export const CRAFTSMANSHIP_QUERY_KEYS = {
  LIST: 'CRAFTSMANSHIP_LIST',
  DETAIL: 'CRAFTSMANSHIP_DETAIL',
};

export const useCraftsmanshipListQuery = (params?: CraftsmanshipListREQ) =>
  useQuery({
    queryKey: [CRAFTSMANSHIP_QUERY_KEYS.LIST, params],
    queryFn: () => getCraftsmanshipListAPI(params),
    select: (resp: PaginationRESP<CraftsmanshipListRESP>) => ({
      list: resp.data.craftsmanship_values,
      pagination: resp.pagination,
    }),
  });

export const useCraftsmanshipDetailQuery = (id?: number | string) =>
  useQuery({
    queryKey: [CRAFTSMANSHIP_QUERY_KEYS.DETAIL, id],
    queryFn: () => getCraftsmanshipDetailAPI(id as number | string),
    select: (resp) => resp.data?.craftsmanship_value,
    enabled: !!id,
  });

export const useCraftsmanshipCreateMutation = (
  options?: UseMutationOptions<BaseRESP<CraftsmanshipDetailRESP>, AxiosError<ErrorRESP>, CraftsmanshipCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (body) => createCraftsmanshipAPI(body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [CRAFTSMANSHIP_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useCraftsmanshipUpdateMutation = (
  options?: UseMutationOptions<
    BaseRESP<CraftsmanshipDetailRESP>,
    AxiosError<ErrorRESP>,
    { id: number | string; body: CraftsmanshipUpdateREQ }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, body }) => updateCraftsmanshipAPI(id, body),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [CRAFTSMANSHIP_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [CRAFTSMANSHIP_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useCraftsmanshipDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<null>, AxiosError<ErrorRESP>, number | string>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => deleteCraftsmanshipAPI(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [CRAFTSMANSHIP_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
