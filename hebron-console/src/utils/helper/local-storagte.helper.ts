import { ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO } from '../constants/common.constant';
import type { UserInfoLocalStorage } from '../types/common.type';

export const persistToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN, token);
};

export const persistRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(REFRESH_TOKEN, refreshToken);
};

export const persistUserInfo = (data: UserInfoLocalStorage): void => {
  localStorage.setItem(USER_INFO, JSON.stringify(data));
};

export const readToken = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  return accessToken || '';
};

export const readRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN);
};

export const readUserInfo = (): UserInfoLocalStorage | null => {
  const storedUserInfo = localStorage.getItem(USER_INFO);
  if (!storedUserInfo) return null;

  return JSON.parse(storedUserInfo);
};

export const deleteToken = (): void => localStorage.removeItem(ACCESS_TOKEN);

export const deleteUserInfo = (): void => localStorage.removeItem(USER_INFO);

export const deleteRefreshToken = (): void => localStorage.removeItem(REFRESH_TOKEN);

export const clearLocalStore = (): void => {
  deleteToken();
  deleteUserInfo();
  deleteRefreshToken();
  localStorage.clear();
};

export const isAuthenticated = () => Boolean(readToken() && readRefreshToken() && readUserInfo());

export const saveInfoToStorage = ({
  accessToken,
  refreshToken,
  userInfo,
}: {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfoLocalStorage;
}) => {
  persistToken(accessToken);
  persistRefreshToken(refreshToken);
  persistUserInfo(userInfo);
};
