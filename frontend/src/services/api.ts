import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const IS_PROD = import.meta.env.VITE_NODE_ENV === 'production';

// In production VITE_BACKEND_URL is irrelevant (same-origin Nginx proxy).
// Relative paths (empty base) let Axios use the current origin automatically.
const BASE_URL = IS_PROD ? '' : (import.meta.env.VITE_BACKEND_URL as string);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HttpOnly refresh_token cookie automatically
});

// ─── Module-level token store ────────────────────────────────────────────────
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};
export const getAccessToken = () => _accessToken;

// ─── Queued retry logic for concurrent 401s ──────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

// ─── Request interceptor: attach Bearer token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const is401 = error.response?.status === 401;
    const isRefreshUrl = originalRequest.url?.includes('/api/auth/refresh');
    const isLoginUrl = originalRequest.url?.includes('/api/auth/login');

    if (is401 && !originalRequest._retry && !isRefreshUrl && !isLoginUrl) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let res;
        if (IS_PROD) {
          // Production: read the refresh token stored in localStorage after login
          const storedRefreshToken = localStorage.getItem('refresh_token');
          res = await api.post('/api/auth/refresh-prod', {
            refresh_token: storedRefreshToken,
          });
        } else {
          // Development: the HttpOnly cookie is sent automatically (withCredentials)
          res = await api.post('/api/auth/refresh');
        }
        const newToken = res.data?.data?.accessToken as string;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
