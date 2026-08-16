import { Helmet } from 'react-helmet-async';
import { useSettings } from '../context/SettingsContext';

/**
 * Per-route meta tags. The site renders client-side, so this plus the sitemap
 * and JSON-LD is what search engines and social previews rely on.
 */
const Seo = ({ title, description, image, type = 'website', path = '' }) => {
  const { settings } = useSettings();
  const siteUrl = settings.seo?.siteUrl ?? 'https://somoyondu.netlify.app';
  const fullTitle = title ? `${title} — ${settings.siteName}` : settings.seo?.defaultTitle ?? settings.siteName;
  const desc = description ?? settings.seo?.defaultDescription ?? '';
  const ogImage = image ?? settings.seo?.ogImageUrl ?? settings.logoUrl;
  const url = `${siteUrl}${path}`;

  return (
    <Helmet>
      <html lang="bn" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={settings.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {settings.faviconUrl && <link rel="icon" href={settings.faviconUrl} />}

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: settings.siteName,
          url: siteUrl,
          logo: settings.logoUrl,
          description: settings.seo?.defaultDescription,
          email: settings.contact?.email,
          telephone: settings.contact?.phone,
          sameAs: (settings.socials ?? []).map((s) => s.url),
        })}
      </script>
    </Helmet>
  );
};

export default Seo;
