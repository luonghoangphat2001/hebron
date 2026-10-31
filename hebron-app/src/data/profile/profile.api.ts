import { api } from '@/api';
import type { BaseRESP } from '@/utils/types/response.type';
import type { ProfileUpdateREQ } from './profile.request';
import type { ProfileDetailRESP } from './profile.response';

const ENDPOINTS = {
  PROFILE: '/mypage/profile',
} as const;

export const profileAPI = {
  getProfile: (): Promise<BaseRESP<ProfileDetailRESP>> => api.get(ENDPOINTS.PROFILE),

  updateProfile: (body: ProfileUpdateREQ): Promise<BaseRESP<ProfileDetailRESP>> => api.put(ENDPOINTS.PROFILE, body),
};
