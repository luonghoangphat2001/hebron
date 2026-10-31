import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { confirmDesignAPI } from './confirm-design.api';
import type { ConfirmDesignREQ } from './confirm-design.request';
import type { ConfirmDesignRESP } from './confirm-design.response';

export const CONFIRM_DESIGN_QUERY_KEYS = {
  all: ['confirm-design'] as const,
  details: () => [...CONFIRM_DESIGN_QUERY_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...CONFIRM_DESIGN_QUERY_KEYS.details(), slug] as const,
};

export const useConfirmDesignDetailQuery = (
  slug: string,
  options?: Omit<UseQueryOptions<BaseRESP<ConfirmDesignRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: CONFIRM_DESIGN_QUERY_KEYS.detail(slug),
    queryFn: () => confirmDesignAPI.getDetailInfo(slug),
    enabled: Boolean(slug),
    ...options,
  });

export const useSendConfirmMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, ConfirmDesignREQ>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: confirmDesignAPI.sendConfirm,
    onSuccess: async (...args) => {
      const [, variables] = args;
      await queryClient.invalidateQueries({ queryKey: CONFIRM_DESIGN_QUERY_KEYS.detail(variables.slug) });
      options?.onSuccess?.(...args);
    },
  });
};
