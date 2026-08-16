/**
 * Build-time content snapshot.
 *
 * The API runs on a free-tier host that sleeps, so the first visitor after an
 * idle period would otherwise stare at a blank page for 30-50 seconds. We bake
 * the latest content into public/fallback.json at build time; the app renders
 * from it instantly and swaps in live data once the API responds.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/fallback.json');
const API = process.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
const TIMEOUT_MS = 60_000;

async function main() {
  console.log(`[fallback] fetching ${API}/public/snapshot`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API}/public/snapshot`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(OUT, JSON.stringify(payload.data ?? payload));
    console.log('[fallback] snapshot written');
  } catch (err) {
    // Never fail the build — an outdated or missing snapshot is recoverable,
    // a broken deploy is not.
    console.warn(`[fallback] could not fetch snapshot (${err.message}); keeping the existing file`);
  } finally {
    clearTimeout(timer);
  }
}

main();
