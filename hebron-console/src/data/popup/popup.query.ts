import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createPopupAPI, deletePopupAPI, getPopupDetailAPI, getPopupListAPI, updatePopupAPI } from './popup.api';
import type { PopupCreateREQ, PopupListREQ, PopupUpdateREQ } from './popup.request';
import type { PopupRESP } from './popup.response';

export const POPUP_QUERY_KEYS = {
  LIST: 'POPUP_LIST',
  DETAIL: 'POPUP_DETAIL',
};

export const usePopupListQuery = (params: PopupListREQ) =>
  useQuery({
    queryKey: [POPUP_QUERY_KEYS.LIST, params],
    queryFn: () => getPopupListAPI(params),
  });

export const usePopupDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [POPUP_QUERY_KEYS.DETAIL, id],
    queryFn: () => getPopupDetailAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const usePopupCreateMutation = (
  options?: UseMutationOptions<BaseRESP<PopupRESP>, AxiosError<ErrorRESP>, PopupCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createPopupAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [POPUP_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePopupUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<PopupRESP>, AxiosError<ErrorRESP>, PopupUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updatePopupAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [POPUP_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [POPUP_QUERY_KEYS.DETAIL] });
      options?.onSuccess?.(...args);
    },
  });
};

export const usePopupDeleteMutation = (
  options?: UseMutationOptions<BaseRESP<Record<string, never>>, AxiosError<ErrorRESP>, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deletePopupAPI,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [POPUP_QUERY_KEYS.LIST] });
      options?.onSuccess?.(...args);
    },
  });
};
