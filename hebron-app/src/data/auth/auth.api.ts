import { api } from '@/api';
import type { SocialProvider } from '@/utils/enums/common.enum';
import type { BaseRESP } from '@/utils/types/response.type';
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

const ENDPOINTS = {
  REGISTER: '/auth/register',
  SEND_CODE: '/auth/send-verification-code',
  VERIFY_CODE: '/auth/verify-verification-code',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FIND_ID: '/auth/find-username',
  RESET_PASSWORD: '/auth/reset-password/with-code',
  SOCIAL_LOGIN_REDIRECT: (provider: SocialProvider) => `/auth/social/${provider}/redirect-url`,
  SOCIAL_LOGIN_CALLBACK: (provider: SocialProvider) => `/auth/social/${provider}/callback`,
};

export const authAPI = {
  register: (body: FormData): Promise<BaseRESP<RegisterRESP>> =>
    api.post(ENDPOINTS.REGISTER, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  sendCode: (body: SendVerifyCodeREQ) => api.post(ENDPOINTS.SEND_CODE, body),
  verifyCode: (data: VerifyCodeREQ) => api.post(ENDPOINTS.VERIFY_CODE, data),
  login: (body: LoginREQ): Promise<BaseRESP<LoginRESP>> => api.post(ENDPOINTS.LOGIN, body),
  logout: (body: LogoutREQ) => api.post(ENDPOINTS.LOGOUT, body),
  getMe: (): Promise<BaseRESP<MeRESP>> => api.get(ENDPOINTS.ME),
  findId: (body: FindIdREQ): Promise<BaseRESP<FindIdRESP>> => api.post(ENDPOINTS.FIND_ID, body),
  resetPassword: (body: ResetPasswordWithCodeREQ) => api.post(ENDPOINTS.RESET_PASSWORD, body),
  getSocialLoginRedirect: (provider: SocialProvider): Promise<BaseRESP<SocialRedirectRESP>> =>
    api.get(ENDPOINTS.SOCIAL_LOGIN_REDIRECT(provider)),
  loginBySocial: (body: LoginSocialREQ): Promise<BaseRESP<LoginRESP>> =>
    api.post(ENDPOINTS.SOCIAL_LOGIN_CALLBACK(body.provider), body),
};
