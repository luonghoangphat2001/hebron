import { authAPI } from '@/data/auth/auth.api';
import { disconnectEcho, setupEcho } from '@/hooks/useWebSocket';
import {
  clearLocalStore,
  isAuthenticated,
  persistRefreshToken,
  persistToken,
  persistUserInfo,
  readUserInfo,
} from '@/utils/helper/local-storagte.helper';
import type { User } from '@/utils/types/user.type';
import type { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

const isUnauthorizedError = (error: unknown): boolean => {
  const status = (error as AxiosError | undefined)?.response?.status;
  return status === 401 || status === 403;
};

type LoginFunctionProps = {
  accessToken: string;
  refreshToken: string;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (data: LoginFunctionProps) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

const fetchAndPersistUser = async (): Promise<User> => {
  const resp = await authAPI.getMe();
  const userInfo = resp.data.user;
  persistUserInfo(userInfo);
  return userInfo;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  const [user, setUser] = useState<User | null>(() => readUserInfo());

  const refreshUser = useCallback(async () => {
    try {
      const userInfo = await fetchAndPersistUser();
      setUser(userInfo);
      setIsLoggedIn(true);
      return userInfo;
    } catch (error) {
      // Keep cached user on transient errors; only clear session when token is invalid
      if (isUnauthorizedError(error)) {
        disconnectEcho();
        clearLocalStore();
        setUser(null);
        setIsLoggedIn(false);
      }
      return null;
    }
  }, []);

  const login = useCallback(async ({ accessToken, refreshToken }: LoginFunctionProps) => {
    persistToken(accessToken);
    persistRefreshToken(refreshToken);

    try {
      const userInfo = await fetchAndPersistUser();
      setUser(userInfo);
      setIsLoggedIn(true);
      setupEcho();
    } catch (error) {
      disconnectEcho();
      clearLocalStore();
      setUser(null);
      setIsLoggedIn(false);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    disconnectEcho();
    clearLocalStore();
    queryClient.clear();
    setUser(null);
    setIsLoggedIn(false);
  }, [queryClient]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isAdmin: Boolean(user?.is_admin || user?.is_super_admin),
      user,
      login,
      logout,
      refreshUser,
    }),
    [isLoggedIn, user, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components -- context hook co-located with provider
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
