import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { AuthTokens } from '@/types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';

// ---------------------------------------------------------------------------
// Access-token cookie helpers (JS-readable, short-lived)
// The refresh_token is httpOnly and managed server-side via /api/auth/* routes.
// ---------------------------------------------------------------------------

const setCookie = (
  name: string,
  value: string,
  maxAgeSeconds: number
): void => {
  if (typeof document === 'undefined') return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax${secure}`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
};

const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; max-age=0; path=/`;
};

// ---------------------------------------------------------------------------
// Server-side route helpers (manage httpOnly refresh_token)
// These use fetch (not apiClient) to avoid interceptor loops.
// ---------------------------------------------------------------------------

async function serverSetTokens(tokens: AuthTokens): Promise<void> {
  try {
    await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });
  } catch {
    // Best-effort — the access token is already set client-side
  }
}

async function serverClearTokens(): Promise<void> {
  try {
    await fetch('/api/auth/clear-tokens', { method: 'POST' });
  } catch {
    // Best-effort
  }
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Token management utilities
// ---------------------------------------------------------------------------

export const tokenStorage = {
  getAccessToken: (): string | null => getCookie(ACCESS_TOKEN_KEY),

  setTokens: async (tokens: AuthTokens): Promise<void> => {
    // Set the access token client-side (JS-readable, needed for Bearer header)
    const maxAge = Math.max(tokens.expires_in ?? 900, 60);
    setCookie(ACCESS_TOKEN_KEY, tokens.access_token, maxAge);
    // Set the refresh token server-side as httpOnly
    await serverSetTokens(tokens);
  },

  clearTokens: async (): Promise<void> => {
    deleteCookie(ACCESS_TOKEN_KEY);
    await serverClearTokens();
  },

  hasTokens: (): boolean => !!getCookie(ACCESS_TOKEN_KEY),
};

// ---------------------------------------------------------------------------
// Request interceptor — inject Bearer header from JS-readable access token
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 / token refresh
//
// On 401 the interceptor calls the Next.js /api/auth/refresh proxy route.
// That route reads the httpOnly refresh_token cookie server-side, exchanges it
// with the backend, and responds with the new access_token in the body while
// setting both new cookies (access_token JS-readable, refresh_token httpOnly).
// ---------------------------------------------------------------------------

// NOTE: These are intentionally module-level (not instance-level).
// This file exports a single apiClient instance; the shared state is safe
// because there is exactly one instance. Do not create additional
// apiClient instances from this module.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const resetAuthState = () => {
  isRefreshing = false;
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: AxiosError) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call our Next.js proxy route — it reads the httpOnly refresh_token
        // cookie server-side and returns the new access_token in the body.
        const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });

        if (!refreshRes.ok) {
          throw new Error(`Refresh failed: ${refreshRes.status}`);
        }

        const refreshData = (await refreshRes.json()) as {
          access_token: string;
          expires_in: number;
        };

        if (!refreshData?.access_token) {
          throw new Error('Invalid refresh response');
        }

        // The proxy route already set both cookies via Set-Cookie headers.
        // Update the in-memory cookie value for the current page context.
        const maxAge = Math.max(refreshData.expires_in ?? 900, 60);
        setCookie(ACCESS_TOKEN_KEY, refreshData.access_token, maxAge);

        processQueue(null, refreshData.access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshData.access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        deleteCookie(ACCESS_TOKEN_KEY);
        void serverClearTokens();
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
