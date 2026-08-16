import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/** Cloudinary transform helper mirroring the API's presets. */
export function cldUrl(secureUrl?: string | null, transform = 'c_fill,w_200,h_200,q_auto,f_auto') {
  if (!secureUrl) return null;
  if (!secureUrl.includes('/upload/')) return secureUrl;
  return secureUrl.replace('/upload/', `/upload/${transform}/`);
}

export function thumb(media?: { secureUrl?: string } | null, size = 96) {
  return cldUrl(media?.secureUrl, `c_fill,g_face,w_${size},h_${size},q_auto,f_auto`);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('bn-BD', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('bn-BD', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/** Converts a sortable list back into API reorder payload shape. */
export function toReorderPayload<T extends { _id: string }>(items: T[]) {
  return { items: items.map((item, index) => ({ id: item._id, displayOrder: index * 10 })) };
}
