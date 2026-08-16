/**
 * Step 1 of the migration: turn the hardcoded src/services/*.jsx files and the
 * public/gallery folder into plain JSON under seed/data/.
 *
 * The legacy service files are pure data functions (no JSX), so they can be
 * evaluated in a sandboxed vm context after stripping the ESM export.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import { DATA_DIR, LEGACY_PUBLIC, LEGACY_SERVICES, SERVICE_GROUPS, YEARS } from './legacy.config';

type LegacyEntry = { name: string; designation: string; image: string };

function loadLegacyService(fileName: string): (year?: number) => LegacyEntry[] {
  const filePath = path.join(LEGACY_SERVICES, `${fileName}.jsx`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Legacy service not found: ${filePath}`);
  }
  const source = fs
    .readFileSync(filePath, 'utf8')
    .replace(/^\s*import[\s\S]*?;\s*$/gm, '')
    .replace(/export\s+default\s+\w+\s*;?/g, '');

  const context: any = { module: {}, exports: {} };
  vm.createContext(context);
  vm.runInContext(`${source}\n;__fn = ${fileName};`, context, { timeout: 5000 });

  const fn = context.__fn;
  if (typeof fn !== 'function') throw new Error(`${fileName} did not evaluate to a function`);
  return fn;
}

function galleryFromFolder() {
  const dir = path.join(LEGACY_PUBLIC, 'gallery');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
    .map((file) => {
      const base = file.replace(/\.[^/.]+$/, '');
      // Legacy titles were derived from the filename, e.g. iftar-mahfil-2024.
      const title = base
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const yearMatch = base.match(/(20\d{2})/);
      const albumSlug = base.replace(/-?(20\d{2})$/, '') || base;
      return {
        file: `gallery/${file}`,
        title,
        year: yearMatch ? Number(yearMatch[1]) : null,
        albumSlug: `${albumSlug}${yearMatch ? `-${yearMatch[1]}` : ''}`,
        albumTitle: title,
      };
    });
}

function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const services = Object.keys(SERVICE_GROUPS);
  const loaded = Object.fromEntries(services.map((s) => [s, loadLegacyService(s)]));

  const summary: Record<string, any> = {};

  for (const year of YEARS) {
    const groups: Record<string, LegacyEntry[]> = {};
    for (const service of services) {
      const group = SERVICE_GROUPS[service];
      const rows = (loaded[service](year) ?? []) as LegacyEntry[];
      groups[group] = rows.filter((r) => r && r.name);
    }
    const total = Object.values(groups).reduce((n, arr) => n + arr.length, 0);
    fs.writeFileSync(
      path.join(DATA_DIR, `${year}.json`),
      JSON.stringify({ year, groups, total }, null, 2),
    );
    summary[year] = { total, byGroup: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])) };
    console.log(`  ${year}: ${total} positions`);
  }

  const founding = loadLegacyService('FoundingMembersService')() ?? [];
  fs.writeFileSync(path.join(DATA_DIR, 'founding.json'), JSON.stringify(founding, null, 2));
  console.log(`  founding: ${founding.length} members`);

  const advisors = loadLegacyService('AdvisorsService')() ?? [];
  fs.writeFileSync(path.join(DATA_DIR, 'advisors.json'), JSON.stringify(advisors, null, 2));
  console.log(`  advisors: ${advisors.length}`);

  const gallery = galleryFromFolder();
  fs.writeFileSync(path.join(DATA_DIR, 'gallery.json'), JSON.stringify(gallery, null, 2));
  console.log(`  gallery: ${gallery.length} images`);

  // Every image path referenced anywhere — the upload script's work list.
  const imagePaths = new Set<string>();
  for (const year of YEARS) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${year}.json`), 'utf8'));
    Object.values(data.groups).forEach((rows: any) =>
      rows.forEach((r: LegacyEntry) => r.image && imagePaths.add(r.image)),
    );
  }
  founding.forEach((r: LegacyEntry) => r.image && imagePaths.add(r.image));
  advisors.forEach((r: LegacyEntry) => r.image && imagePaths.add(r.image));
  gallery.forEach((g) => imagePaths.add(g.file));
  ['logo.png', 'white-logo.png', 'somoyon-bg.png', 'bkash.png', 'nagad.png', 'rocket.png'].forEach((f) =>
    imagePaths.add(f),
  );

  fs.writeFileSync(
    path.join(DATA_DIR, 'images.json'),
    JSON.stringify([...imagePaths].sort(), null, 2),
  );
  console.log(`  images referenced: ${imagePaths.size}`);

  fs.writeFileSync(path.join(DATA_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nExtraction complete →', DATA_DIR);
}

main();
