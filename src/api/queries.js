import { useQuery } from '@tanstack/react-query';
import { get, getWithMeta, loadFallback, post } from './client';

/**
 * Every public query falls back to the build-time snapshot when the API is
 * unreachable, so the site never renders empty.
 */
function withFallback(fetcher, pick) {
  return async () => {
    try {
      return await fetcher();
    } catch (error) {
      const snapshot = await loadFallback();
      const fallbackValue = snapshot ? pick(snapshot) : undefined;
      if (fallbackValue !== undefined && fallbackValue !== null) return fallbackValue;
      throw error;
    }
  };
}

const LONG = { staleTime: 5 * 60_000, gcTime: 24 * 60 * 60_000, retry: 1 };

export function useBootstrap() {
  return useQuery({
    queryKey: ['bootstrap'],
    queryFn: withFallback(
      () => get('/public/bootstrap'),
      (snap) => ({ settings: snap.settings, committeeYears: snap.committeeList?.map((c) => c.year) ?? [] }),
    ),
    ...LONG,
  });
}

export function useCommittees() {
  return useQuery({
    queryKey: ['committees'],
    queryFn: withFallback(() => get('/public/committees'), (snap) => snap.committeeList),
    ...LONG,
  });
}

export function useCommittee(year) {
  return useQuery({
    queryKey: ['committee', year],
    queryFn: withFallback(
      () => get(`/public/committees/${year}`),
      (snap) => snap.committees?.find((c) => c.year === Number(year)),
    ),
    enabled: !!year,
    ...LONG,
  });
}

export function useFoundingMembers() {
  return useQuery({
    queryKey: ['founding-members'],
    queryFn: withFallback(() => get('/public/founding-members'), (snap) => snap.foundingMembers),
    ...LONG,
  });
}

export function useAdvisors() {
  return useQuery({
    queryKey: ['advisors'],
    queryFn: withFallback(() => get('/public/advisors'), (snap) => snap.advisors),
    ...LONG,
  });
}

export function useGallery(limit = 30) {
  return useQuery({
    queryKey: ['gallery', limit],
    queryFn: withFallback(() => get('/public/gallery', { limit }), (snap) => snap.gallery),
    ...LONG,
  });
}

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: withFallback(() => get('/public/gallery/albums'), (snap) => snap.albums),
    ...LONG,
  });
}

export function useAlbum(slug) {
  return useQuery({
    queryKey: ['album', slug],
    queryFn: () => get(`/public/gallery/albums/${slug}`),
    enabled: !!slug,
    ...LONG,
  });
}

export function useEvents(params = {}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: withFallback(
      () => getWithMeta('/public/events', params),
      (snap) => ({ items: snap.events ?? [], meta: null }),
    ),
    ...LONG,
  });
}

export function useEvent(slug) {
  return useQuery({
    queryKey: ['event', slug],
    queryFn: () => get(`/public/events/${slug}`),
    enabled: !!slug,
    ...LONG,
  });
}

export function usePosts(params = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: withFallback(
      () => getWithMeta('/public/posts', params),
      (snap) => ({ items: snap.posts ?? [], meta: null }),
    ),
    ...LONG,
  });
}

export function usePost(slug) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => get(`/public/posts/${slug}`),
    enabled: !!slug,
    ...LONG,
  });
}

export function submitContact(body) {
  return post('/public/contact', body);
}
