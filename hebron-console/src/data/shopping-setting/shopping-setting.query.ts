import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getShoppingSettingDetailAPI, getShoppingSettingListAPI, updateShoppingSettingAPI } from './shopping-setting.api';
import type { ShoppingSettingUpdateREQ } from './shopping-setting.request';
import type { ShoppingSettingDetailRESP } from './shopping-setting.response';

export const SHOPPING_SETTING_QUERY_KEYS = {
  LIST: 'SHOPPING_SETTING_LIST',
  DETAIL: 'SHOPPING_SETTING_DETAIL',
};

export const useShoppingSettingListQuery = () =>
  useQuery({
    queryKey: [SHOPPING_SETTING_QUERY_KEYS.LIST],
    queryFn: getShoppingSettingListAPI,
    select: (resp) => resp.data.settings,
  });

export const useShoppingSettingDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [SHOPPING_SETTING_QUERY_KEYS.DETAIL, id],
    queryFn: () => getShoppingSettingDetailAPI(id as number),
    select: (resp) => resp.data,
    enabled: !!id,
  });

export const useShoppingSettingUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<ShoppingSettingDetailRESP>, AxiosError<ErrorRESP>, ShoppingSettingUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateShoppingSettingAPI,
    onSuccess: (resp, variables, ...rest) => {
      // Seed the cache with the PUT response directly instead of refetching —
      // the GET endpoints are public/cacheable, so an invalidate-triggered
      // refetch can race back a stale copy and clobber the just-saved content.
      queryClient.setQueryData([SHOPPING_SETTING_QUERY_KEYS.DETAIL, variables.id], resp);
      options?.onSuccess?.(resp, variables, ...rest);
    },
  });
};
