import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { DesignAPI } from './design.api';
import type { DesignCreateREQ, DesignUpdateREQ } from './design.request';
import type { DesignCreateRESP } from './design.response';

export const designQueryKeys = {
  DETAIL: 'DESIGN_DETAIL',
};

export const useDesignDetailQuery = (designId?: number) =>
  useQuery({
    queryKey: [designQueryKeys.DETAIL, designId],
    queryFn: () => DesignAPI.detail(designId as number),
    select: (resp) => resp.data,
    enabled: !!designId,
  });

export const useCreateDesignEditorMutation = (
  options?: UseMutationOptions<BaseRESP<DesignCreateRESP>, AxiosError<ErrorRESP>, DesignCreateREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: DesignAPI.create,
  });

export const useUpdateDesignEditorMutation = (
  options?: UseMutationOptions<BaseRESP<DesignCreateRESP>, AxiosError<ErrorRESP>, DesignUpdateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DesignAPI.update,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [designQueryKeys.DETAIL] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
