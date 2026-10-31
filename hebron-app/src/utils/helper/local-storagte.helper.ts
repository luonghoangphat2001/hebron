import { ACCESS_TOKEN, GUEST_TOKEN, REFRESH_TOKEN, USER_INFO } from '../constants/common.constant';
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

export const persistGuestToken = (token: string): void => {
  localStorage.setItem(GUEST_TOKEN, token);
};

export const readToken = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  return accessToken || '';
};

export const readGuestToken = () => localStorage.getItem(GUEST_TOKEN) || '';

// export const setMockLoggedIn = (value: boolean): void => {
//   if (value) {
//     localStorage.setItem(MOCK_LOGGED_IN, 'true');
//     return;
//   }

//   localStorage.removeItem(MOCK_LOGGED_IN);
// };

// export const readMockLoggedIn = (): boolean => localStorage.getItem(MOCK_LOGGED_IN) === 'true';

/** User is considered logged in when mock flag or token exists (Header + route guards must use the same check). */
export const isAuthenticated = (): boolean => Boolean(readToken() && readRefreshToken() && readUserInfo());

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

export const deleteGuestToken = (): void => localStorage.removeItem(GUEST_TOKEN);

export const deleteRefreshToken = (): void => localStorage.removeItem(REFRESH_TOKEN);

export const clearLocalStore = (): void => {
  deleteToken();
  deleteUserInfo();
  deleteRefreshToken();
  deleteGuestToken();
  // setMockLoggedIn(false);
};
