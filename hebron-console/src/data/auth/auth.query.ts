import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authAPI } from './auth.api';
import type { LoginREQ, LogoutREQ } from './auth.request';
import type { LoginRESP } from './auth.response';

export const useLoginMutation = (options?: UseMutationOptions<BaseRESP<LoginRESP>, AxiosError<ErrorRESP>, LoginREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.login,
  });

export const useLogoutMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, LogoutREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.logout,
  });
