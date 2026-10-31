import { useAuth } from '@/contexts/AuthContext';
import { AUTH_QUERY_KEYS } from '@/data/auth/auth.query';
import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { profileAPI } from './profile.api';
import type { ProfileUpdateREQ } from './profile.request';
import type { ProfileDetailRESP } from './profile.response';

export const PROFILE_QUERY_KEYS = {
  all: ['profile'] as const,
  detail: () => [...PROFILE_QUERY_KEYS.all, 'detail'] as const,
};

export const useProfileQuery = (
  options?: Omit<UseQueryOptions<BaseRESP<ProfileDetailRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: PROFILE_QUERY_KEYS.detail(),
    queryFn: profileAPI.getProfile,
    ...options,
  });

export const useUpdateProfileMutation = (
  options?: UseMutationOptions<BaseRESP<ProfileDetailRESP>, AxiosError<ErrorRESP>, ProfileUpdateREQ>,
) => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    ...options,
    mutationFn: profileAPI.updateProfile,
    onSuccess: async (...args) => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });
      await refreshUser();
      await options?.onSuccess?.(...args);
    },
  });
};
