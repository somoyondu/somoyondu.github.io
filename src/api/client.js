import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000, // free-tier hosts cold-start slowly
  headers: { 'Content-Type': 'application/json' },
});

/** Unwraps the API's { success, data, meta } envelope. */
export async function get(url, params) {
  const { data } = await api.get(url, { params });
  return data.data;
}

export async function getWithMeta(url, params) {
  const { data } = await api.get(url, { params });
  return { items: data.data, meta: data.meta };
}

export async function post(url, body) {
  const { data } = await api.post(url, body);
  return data.data;
}

export function apiError(error) {
  return (
    error?.response?.data?.error?.message ??
    error?.message ??
    'তথ্য লোড করা যায়নি'
  );
}

let fallbackCache = null;

/**
 * Build-time content snapshot. Used when the API is unreachable (typically a
 * sleeping free-tier instance) so the site still renders real content.
 */
export async function loadFallback() {
  if (fallbackCache) return fallbackCache;
  try {
    const res = await fetch('/fallback.json', { cache: 'force-cache' });
    if (!res.ok) return null;
    fallbackCache = await res.json();
    return fallbackCache;
  } catch {
    return null;
  }
}
