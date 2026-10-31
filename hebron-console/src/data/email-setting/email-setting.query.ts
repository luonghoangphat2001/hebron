import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getEmailSettingAPI, updateEmailSettingAPI } from './email-setting.api';
import type { EmailSettingUpdateREQ } from './email-setting.request';
import type { EmailSettingRESP } from './email-setting.response';

export const EMAIL_SETTING_QUERY_KEYS = {
  DETAIL: ['email-setting'] as const,
};

export const useEmailSettingQuery = () =>
  useQuery({
    queryKey: EMAIL_SETTING_QUERY_KEYS.DETAIL,
    queryFn: getEmailSettingAPI,
    select: (response) => response.data,
  });

export const useEmailSettingUpdateMutation = (
  options?: UseMutationOptions<BaseRESP<EmailSettingRESP>, AxiosError<ErrorRESP>, EmailSettingUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateEmailSettingAPI,
    onSuccess: (response, variables, ...rest) => {
      queryClient.setQueryData(EMAIL_SETTING_QUERY_KEYS.DETAIL, response);
      options?.onSuccess?.(response, variables, ...rest);
    },
  });
};
