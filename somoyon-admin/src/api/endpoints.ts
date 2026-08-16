import { request, requestWithMeta } from './client';
import type {
  Advisor, AuditLog, AuthUser, Committee, ContactSubmission, DashboardStats, Designation,
  EventItem, GalleryAlbum, GalleryItem, Media, Person, Position, PostItem, SiteSettings,
} from '@/lib/types';

type Query = Record<string, any>;

/* ------------------------------- auth -------------------------------- */
export const authApi = {
  login: (body: { email: string; password: string }) =>
    request<{ accessToken: string; user: AuthUser }>({ url: '/auth/login', method: 'POST', data: body }),
  googleConfig: () =>
    request<{ enabled: boolean; clientId: string | null }>({ url: '/auth/google/config' }),
  googleLogin: (idToken: string) =>
    request<{ accessToken: string; user: AuthUser }>({
      url: '/auth/google', method: 'POST', data: { idToken },
    }),
  logout: () => request<{ success: boolean }>({ url: '/auth/logout', method: 'POST' }),
  me: () => request<AuthUser>({ url: '/auth/me' }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean }>({ url: '/auth/change-password', method: 'PATCH', data: body }),
  forgotPassword: (email: string) =>
    request<{ success: boolean }>({ url: '/auth/forgot-password', method: 'POST', data: { email } }),
  resetPassword: (body: { token: string; newPassword: string }) =>
    request<{ success: boolean }>({ url: '/auth/reset-password', method: 'POST', data: body }),
};

/* ----------------------------- dashboard ----------------------------- */
export const dashboardApi = {
  stats: () => request<DashboardStats>({ url: '/admin/dashboard/stats' }),
};

/* ------------------------------- media ------------------------------- */
export const mediaApi = {
  list: (params?: Query) =>
    requestWithMeta<Media[]>({ url: '/admin/media', params }),
  folders: () => request<{ folder: string; count: number }[]>({ url: '/admin/media/folders' }),
  signature: (body: { folder?: string; tags?: string[] }) =>
    request<{
      signature: string; timestamp: number; apiKey: string; cloudName: string;
      folder: string; uploadUrl: string; maxBytes: number; allowedFormats: string[];
    }>({ url: '/admin/media/signature', method: 'POST', data: body }),
  register: (body: { publicId: string; alt?: string; tags?: string[] }) =>
    request<Media>({ url: '/admin/media', method: 'POST', data: body }),
  update: (id: string, body: Partial<Media>) =>
    request<Media>({ url: `/admin/media/${id}`, method: 'PATCH', data: body }),
  usage: (id: string) =>
    request<{ total: number; breakdown: Record<string, number> }>({ url: `/admin/media/${id}/usage` }),
  remove: (id: string, force = false) =>
    request<{ id: string }>({ url: `/admin/media/${id}`, method: 'DELETE', params: { force } }),
};

/* ---------------------------- designations --------------------------- */
export const designationsApi = {
  all: () => request<Designation[]>({ url: '/admin/designations/all' }),
  list: (params?: Query) => requestWithMeta<Designation[]>({ url: '/admin/designations', params }),
  create: (body: Partial<Designation>) =>
    request<Designation>({ url: '/admin/designations', method: 'POST', data: body }),
  update: (id: string, body: Partial<Designation>) =>
    request<Designation>({ url: `/admin/designations/${id}`, method: 'PATCH', data: body }),
  remove: (id: string) => request<any>({ url: `/admin/designations/${id}`, method: 'DELETE' }),
};

/* ------------------------------ people ------------------------------- */
export const peopleApi = {
  list: (params?: Query) => requestWithMeta<Person[]>({ url: '/admin/people', params }),
  get: (id: string) => request<Person>({ url: `/admin/people/${id}` }),
  history: (id: string) => request<any[]>({ url: `/admin/people/${id}/history` }),
  duplicates: () =>
    request<{ normalizedName: string; ids: string[]; names: string[]; count: number }[]>({
      url: '/admin/people/duplicates',
    }),
  create: (body: Partial<Person> & { photo?: string }) =>
    request<Person>({ url: '/admin/people', method: 'POST', data: body }),
  update: (id: string, body: Partial<Person> & { photo?: string }) =>
    request<Person>({ url: `/admin/people/${id}`, method: 'PATCH', data: body }),
  merge: (body: { keepId: string; mergeIds: string[] }) =>
    request<any>({ url: '/admin/people/merge', method: 'POST', data: body }),
  remove: (id: string) => request<any>({ url: `/admin/people/${id}`, method: 'DELETE' }),
};

/* ---------------------------- committees ----------------------------- */
export const committeesApi = {
  summary: () => request<Committee[]>({ url: '/admin/committees/summary' }),
  get: (id: string) => request<Committee>({ url: `/admin/committees/${id}` }),
  positions: (id: string, group?: string) =>
    request<Position[]>({ url: `/admin/committees/${id}/positions`, params: { group } }),
  create: (body: Partial<Committee>) =>
    request<Committee>({ url: '/admin/committees', method: 'POST', data: body }),
  update: (id: string, body: Partial<Committee>) =>
    request<Committee>({ url: `/admin/committees/${id}`, method: 'PATCH', data: body }),
  publish: (id: string, status: string) =>
    request<Committee>({ url: `/admin/committees/${id}/publish`, method: 'PATCH', data: { status } }),
  clone: (body: { sourceYear: number; targetYear: number; copyPeople?: boolean }) =>
    request<{ committee: Committee; positionsCopied: number; note: string }>({
      url: '/admin/committees/clone', method: 'POST', data: body,
    }),
  remove: (id: string) => request<any>({ url: `/admin/committees/${id}`, method: 'DELETE' }),

  addPosition: (committeeId: string, body: Record<string, any>) =>
    request<Position>({ url: `/admin/committees/${committeeId}/positions`, method: 'POST', data: body }),
  updatePosition: (positionId: string, body: Record<string, any>) =>
    request<Position>({ url: `/admin/committees/positions/${positionId}`, method: 'PATCH', data: body }),
  removePosition: (positionId: string) =>
    request<any>({ url: `/admin/committees/positions/${positionId}`, method: 'DELETE' }),
  reorderPositions: (committeeId: string, items: { id: string; displayOrder: number }[]) =>
    request<any>({
      url: `/admin/committees/${committeeId}/positions/reorder`, method: 'PATCH', data: { items },
    }),
};

/* ----------------------------- advisors ------------------------------ */
export const advisorsApi = {
  list: (params?: Query) => requestWithMeta<Advisor[]>({ url: '/admin/advisors', params }),
  create: (body: Partial<Advisor> & { photo?: string }) =>
    request<Advisor>({ url: '/admin/advisors', method: 'POST', data: body }),
  update: (id: string, body: Partial<Advisor> & { photo?: string }) =>
    request<Advisor>({ url: `/admin/advisors/${id}`, method: 'PATCH', data: body }),
  reorder: (items: { id: string; displayOrder: number }[]) =>
    request<any>({ url: '/admin/advisors/reorder', method: 'PATCH', data: { items } }),
  remove: (id: string) => request<any>({ url: `/admin/advisors/${id}`, method: 'DELETE' }),
};

/* ------------------------------ gallery ------------------------------ */
export const galleryApi = {
  albums: () => request<GalleryAlbum[]>({ url: '/admin/gallery/albums' }),
  album: (id: string) => request<GalleryAlbum>({ url: `/admin/gallery/albums/${id}` }),
  items: (id: string) => request<GalleryItem[]>({ url: `/admin/gallery/albums/${id}/items` }),
  createAlbum: (body: Partial<GalleryAlbum> & { coverImage?: string }) =>
    request<GalleryAlbum>({ url: '/admin/gallery/albums', method: 'POST', data: body }),
  updateAlbum: (id: string, body: Partial<GalleryAlbum> & { coverImage?: string }) =>
    request<GalleryAlbum>({ url: `/admin/gallery/albums/${id}`, method: 'PATCH', data: body }),
  removeAlbum: (id: string) => request<any>({ url: `/admin/gallery/albums/${id}`, method: 'DELETE' }),
  bulkAddItems: (albumId: string, mediaIds: string[], isFeatured = false) =>
    request<{ added: number }>({
      url: `/admin/gallery/albums/${albumId}/items/bulk`, method: 'POST',
      data: { mediaIds, isFeatured },
    }),
  updateItem: (itemId: string, body: Partial<GalleryItem>) =>
    request<GalleryItem>({ url: `/admin/gallery/items/${itemId}`, method: 'PATCH', data: body }),
  removeItem: (itemId: string) => request<any>({ url: `/admin/gallery/items/${itemId}`, method: 'DELETE' }),
  reorderItems: (items: { id: string; displayOrder: number }[]) =>
    request<any>({ url: '/admin/gallery/items/reorder', method: 'PATCH', data: { items } }),
};

/* ------------------------------ events ------------------------------- */
export const eventsApi = {
  list: (params?: Query) => requestWithMeta<EventItem[]>({ url: '/admin/events', params }),
  get: (id: string) => request<EventItem>({ url: `/admin/events/${id}` }),
  create: (body: Record<string, any>) =>
    request<EventItem>({ url: '/admin/events', method: 'POST', data: body }),
  update: (id: string, body: Record<string, any>) =>
    request<EventItem>({ url: `/admin/events/${id}`, method: 'PATCH', data: body }),
  publish: (id: string, status: string) =>
    request<EventItem>({ url: `/admin/events/${id}/publish`, method: 'PATCH', data: { status } }),
  remove: (id: string) => request<any>({ url: `/admin/events/${id}`, method: 'DELETE' }),
};

/* ------------------------------- posts ------------------------------- */
export const postsApi = {
  list: (params?: Query) => requestWithMeta<PostItem[]>({ url: '/admin/posts', params }),
  get: (id: string) => request<PostItem>({ url: `/admin/posts/${id}` }),
  create: (body: Record<string, any>) =>
    request<PostItem>({ url: '/admin/posts', method: 'POST', data: body }),
  update: (id: string, body: Record<string, any>) =>
    request<PostItem>({ url: `/admin/posts/${id}`, method: 'PATCH', data: body }),
  publish: (id: string, status: string) =>
    request<PostItem>({ url: `/admin/posts/${id}/publish`, method: 'PATCH', data: { status } }),
  remove: (id: string) => request<any>({ url: `/admin/posts/${id}`, method: 'DELETE' }),
};

/* ------------------------------ settings ----------------------------- */
export const settingsApi = {
  get: () => request<SiteSettings>({ url: '/admin/settings' }),
  update: (body: Partial<SiteSettings> & Record<string, any>) =>
    request<SiteSettings>({ url: '/admin/settings', method: 'PATCH', data: body }),
};

/* ------------------------------- inbox ------------------------------- */
export const contactApi = {
  list: (params?: Query) => requestWithMeta<ContactSubmission[]>({ url: '/admin/contact', params }),
  unreadCount: () => request<{ count: number }>({ url: '/admin/contact/unread-count' }),
  update: (id: string, body: { status?: string; adminNote?: string }) =>
    request<ContactSubmission>({ url: `/admin/contact/${id}`, method: 'PATCH', data: body }),
  remove: (id: string) => request<any>({ url: `/admin/contact/${id}`, method: 'DELETE' }),
};

/* ------------------------------- users ------------------------------- */
export const usersApi = {
  list: (params?: Query) => requestWithMeta<AuthUser[]>({ url: '/admin/users', params }),
  create: (body: Record<string, any>) =>
    request<AuthUser>({ url: '/admin/users', method: 'POST', data: body }),
  update: (id: string, body: Record<string, any>) =>
    request<AuthUser>({ url: `/admin/users/${id}`, method: 'PATCH', data: body }),
  remove: (id: string) => request<any>({ url: `/admin/users/${id}`, method: 'DELETE' }),
};

/* ------------------------------- audit ------------------------------- */
export const auditApi = {
  list: (params?: Query) => requestWithMeta<AuditLog[]>({ url: '/admin/audit-logs', params }),
};
