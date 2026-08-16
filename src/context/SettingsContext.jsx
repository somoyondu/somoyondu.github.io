import { createContext, useContext, useMemo } from 'react';
import { useBootstrap } from '../api/queries';

const SettingsContext = createContext({ settings: null, isLoading: true, isStale: false });

/** Sensible defaults so the very first paint is never blank or broken. */
const DEFAULTS = {
  siteName: 'সময়ন',
  tagline: 'বন্ধনে আমরা',
  hero: {},
  about: {},
  foundingBlurb: {},
  advisoryBlurb: {},
  galleryBlurb: { title: 'গ্যালারি', subtitle: 'একনজরে সময়নের কার্যক্রম' },
  contact: {},
  socials: [],
  donation: { methods: [] },
  navLinks: [],
  seo: {},
};

export function SettingsProvider({ children }) {
  const { data, isLoading, isError } = useBootstrap();

  const value = useMemo(
    () => ({
      settings: { ...DEFAULTS, ...(data?.settings ?? {}) },
      committeeYears: data?.committeeYears ?? [],
      isLoading,
      // True when we are rendering the build-time snapshot, not live data.
      isStale: isError || (!isLoading && !data?.generatedAt),
    }),
    [data, isLoading, isError],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
