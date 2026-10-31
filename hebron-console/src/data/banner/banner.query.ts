import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createBannerAPI, deleteBannerAPI, getBannerDetailAPI, getBannerListAPI, updateBannerAPI } from './banner.api';
import type { BannerCreateREQ, BannerListREQ, BannerUpdateREQ } from './banner.request';
import type { BannerRESP } from './banner.response';

export const BANNER_QUERY_KEYS = {
  LIST: 'BANNER_LIST',
  DETAIL: 'BANNER_DETAIL',
};

export const useBannerListQuery = (params: BannerListREQ) =>
  useQuery({
    queryKey: [BANNER_QUERY_KEYS.LIST, params],
    queryFn: () => getBannerListAPI(params),
  });

export const useBannerDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [BANNER_QUERY_KEYS.DETAIL, id],
    queryFn: () => getBannerDetailAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useBannerCreateMutation = (
  options?: UseMutationOptions<BaseRESP<BannerRESP>, AxiosError<ErrorRESP>, BannerCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createBannerAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [BANNER_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useBannerUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<BannerRESP>, AxiosError<ErrorRESP>, BannerUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateBannerAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [BANNER_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [BANNER_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useBannerDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteBannerAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [BANNER_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
