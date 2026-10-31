import type { BaseRESP, ErrorRESP, PaginationRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createGuideAPI, deleteGuideAPI, getGuideDetailAPI, getGuideListAPI, updateGuideAPI } from './guide.api';
import type { GuideCreateREQ, GuideListREQ, GuideUpdateREQ } from './guide.request';
import type { GuideCreateRESP, GuideListRESP } from './guide.response';

export const GUIDE_QUERY_KEYS = {
  LIST: 'GUIDE_LIST',
  DETAIL: 'GUIDE_DETAIL',
};

export const useGuideListQuery = (params: GuideListREQ) =>
  useQuery({
    queryKey: [GUIDE_QUERY_KEYS.LIST, params],
    queryFn: () => getGuideListAPI(params),
    select: (resp: PaginationRESP<GuideListRESP>) => ({
      list: resp.data.guide_contents,
      pagination: resp.pagination,
    }),
  });

export const useGuideDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [GUIDE_QUERY_KEYS.DETAIL, id],
    queryFn: () => getGuideDetailAPI(id as number),
    select: (resp) => resp.data.guide_content,
    enabled: !!id,
  });

export const useGuideCreateMutation = (
  options?: UseMutationOptions<BaseRESP<GuideCreateRESP>, AxiosError<ErrorRESP>, GuideCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createGuideAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [GUIDE_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useGuideUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<GuideCreateRESP>, AxiosError<ErrorRESP>, GuideUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateGuideAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [GUIDE_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [GUIDE_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const useGuideDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteGuideAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [GUIDE_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
