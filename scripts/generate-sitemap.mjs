/** Builds dist/sitemap.xml + robots.txt from the API's slug list. */
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const API = process.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
const SITE = process.env.VITE_SITE_URL ?? 'https://somoyondu.netlify.app';

const STATIC_ROUTES = ['/', '/gallery', '/events', '/notices', '/contact'];

async function main() {
  let routes = [...STATIC_ROUTES];
  try {
    const res = await fetch(`${API}/public/sitemap`);
    if (res.ok) {
      const { data } = await res.json();
      routes.push(...data.committees, ...data.albums, ...data.events, ...data.posts);
    }
  } catch (err) {
    console.warn(`[sitemap] API unavailable (${err.message}); writing static routes only`);
  }

  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(routes)]
  .map(
    (route) => `  <url>
    <loc>${SITE}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.7'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  await writeFile(resolve(DIST, 'sitemap.xml'), xml);
  await writeFile(
    resolve(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  );
  console.log(`[sitemap] ${[...new Set(routes)].length} routes written`);
}

main();
