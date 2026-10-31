import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { LoginREQ, LogoutREQ } from './auth.request';
import type { LoginRESP } from './auth.response';

const ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
};

export const authAPI = {
  login: (body: LoginREQ): Promise<BaseRESP<LoginRESP>> => api.post(ENDPOINTS.LOGIN, body),
  logout: (body: LogoutREQ) => api.post(ENDPOINTS.LOGOUT, body),
};
