import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

/**
 * The access token lives in memory only — never localStorage. The refresh
 * token is an httpOnly cookie the browser sends automatically.
 */
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = data?.data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;

    if (status === 401 && original && !original._retried && !original.url?.includes('/auth/')) {
      original._retried = true;
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      }
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: any;
}

/** Unwraps the API's { success, data, meta } envelope. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await api.request<Envelope<T>>(config);
  return data.data;
}

export async function requestWithMeta<T>(config: AxiosRequestConfig): Promise<{ data: T; meta: any }> {
  const { data } = await api.request<Envelope<T>>(config);
  return { data: data.data, meta: data.meta };
}

export function apiError(error: unknown): string {
  const err = error as AxiosError<any>;
  const payload = err?.response?.data?.error;
  if (payload?.details?.length) return payload.details.join(', ');
  return payload?.message ?? err?.message ?? 'কিছু একটা সমস্যা হয়েছে';
}

export { refreshAccessToken };
