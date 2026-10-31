import type { BaseRESP, ErrorRESP } from '@/utils/types/response.type';
import type { SocialProvider } from '@/utils/enums/common.enum';
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { authAPI } from './auth.api';
import type {
  FindIdREQ,
  LoginREQ,
  LoginSocialREQ,
  LogoutREQ,
  ResetPasswordWithCodeREQ,
  SendVerifyCodeREQ,
  VerifyCodeREQ,
} from './auth.request';
import type { FindIdRESP, LoginRESP, MeRESP, RegisterRESP, SocialRedirectRESP } from './auth.response';

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  me: () => [...AUTH_QUERY_KEYS.all, 'me'] as const,
};

export const useRegisterMutation = (options?: UseMutationOptions<BaseRESP<RegisterRESP>, AxiosError<ErrorRESP>, FormData>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.register,
  });

export const useSendCodeMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, SendVerifyCodeREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.sendCode,
  });

export const useVerifyCodeMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, VerifyCodeREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.verifyCode,
  });

export const useLoginMutation = (options?: UseMutationOptions<BaseRESP<LoginRESP>, AxiosError<ErrorRESP>, LoginREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.login,
  });

export const useGetMeAPI = (options?: Omit<UseQueryOptions<BaseRESP<MeRESP>, AxiosError<ErrorRESP>>, 'queryKey' | 'queryFn'>) =>
  useQuery({
    queryKey: AUTH_QUERY_KEYS.me(),
    queryFn: authAPI.getMe,
    ...options,
  });

export const useFindIdMutation = (options?: UseMutationOptions<BaseRESP<FindIdRESP>, AxiosError<ErrorRESP>, FindIdREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.findId,
  });

export const useResetPasswordMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, ResetPasswordWithCodeREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.resetPassword,
  });

export const useLogoutMutation = (options?: UseMutationOptions<any, AxiosError<ErrorRESP>, LogoutREQ>) =>
  useMutation({
    ...options,
    mutationFn: authAPI.logout,
  });

export const useSocialRedirectMutation = (
  options?: UseMutationOptions<BaseRESP<SocialRedirectRESP>, AxiosError<ErrorRESP>, SocialProvider>,
) =>
  useMutation({
    ...options,
    mutationFn: authAPI.getSocialLoginRedirect,
  });

export const useSocialLoginMutation = (
  options?: UseMutationOptions<BaseRESP<LoginRESP>, AxiosError<ErrorRESP>, LoginSocialREQ>,
) =>
  useMutation({
    ...options,
    mutationFn: authAPI.loginBySocial,
  });
