import { NO_REDIRECT_ROUTES } from '@/utils/constants/common.constant';
import {
  clearLocalStore,
  persistGuestToken,
  persistRefreshToken,
  persistToken,
  readGuestToken,
  readRefreshToken,
  readToken,
} from '@/utils/helper/local-storagte.helper';
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

const onRequest = async (config: AxiosRequestConfig): Promise<any> => {
  const token = readToken();
  if (token) {
    return { ...config, headers: { ...config.headers, Authorization: `Bearer ${token}` } };
  }

  const guestToken = readGuestToken();
  if (guestToken) {
    return { ...config, headers: { ...config.headers, 'X-Guest-Token': guestToken } };
  }

  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  const guestToken = response.headers['x-guest-token'];

  if (typeof guestToken === 'string' && guestToken) {
    persistGuestToken(guestToken);
  }

  return response.data;
};

// Handle token refresh logic
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const refreshToken = readRefreshToken();
    if (!refreshToken) return null;

    // use axios directly to avoid the interceptor
    const response = await axios.post(`${import.meta.env.VITE_API_ENDPOINT}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    if (response?.data?.data) {
      const { access_token } = response.data.data;
      persistRefreshToken(refreshToken);
      persistToken(access_token);
      return access_token;
    }
  } catch {
    return null;
  }

  return null;
};

const onResponseError = async (error: AxiosError): Promise<any> => {
  const originalRequest = error.config;
  const isBlock = NO_REDIRECT_ROUTES.includes(window.location.pathname);

  // Check if request should be retried on 401/403 and not on blocked routes
  if (
    originalRequest &&
    !isBlock &&
    (error.response?.status === 401 || error.response?.status === 403) &&
    !(originalRequest as any)._retry
  ) {
    // If a token refresh is already in progress, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark request as retried and start token refresh
    (originalRequest as any)._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshToken();
      if (newToken) {
        // Process queued requests with new token
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        // If token refresh fails, clear auth and logout
        processQueue(error, null);
        clearLocalStore();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    } catch (err) {
      // Handle errors during token refresh
      processQueue(err, null);
      clearLocalStore();
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }

  // For other errors, reject
  return Promise.reject(error);
};

api.interceptors.request.use(onRequest, onRequestError);
api.interceptors.response.use(onResponse, onResponseError);
