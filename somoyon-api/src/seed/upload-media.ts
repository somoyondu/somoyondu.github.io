/**
 * Step 2: bulk-upload every legacy image in public/ to Cloudinary and write
 * seed/media-map.json ({ legacyPath -> cloudinary metadata }).
 *
 * Resumable: progress is checkpointed after every file, so a rate-limited or
 * interrupted run can simply be restarted.
 */
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { CHECKPOINT, DATA_DIR, LEGACY_PUBLIC, MEDIA_MAP, mapCloudinaryFolder } from './legacy.config';

dotenv.config();

const CONCURRENCY = 5;
const ROOT_FOLDER = process.env.CLOUDINARY_ROOT_FOLDER || 'somoyon';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type MediaEntry = {
  publicId: string;
  secureUrl: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  legacyPath: string;
};

function load<T>(file: string, fallback: T): T {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
}

/** Normalises .JPG/.jpeg casing and strips characters Cloudinary dislikes. */
function publicIdFor(legacyPath: string) {
  const withoutExt = legacyPath.replace(/\.[^/.]+$/, '');
  const base = withoutExt.split('/').pop()!;
  const folder = mapCloudinaryFolder(legacyPath);
  const safe = base.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
  return `${ROOT_FOLDER}/${folder}/${safe}`;
}

async function uploadOne(legacyPath: string): Promise<MediaEntry | null> {
  const abs = path.join(LEGACY_PUBLIC, legacyPath);
  if (!fs.existsSync(abs)) {
    console.warn(`  ! missing on disk: ${legacyPath}`);
    return null;
  }
  const publicId = publicIdFor(legacyPath);
  const res = await cloudinary.uploader.upload(abs, {
    public_id: publicId,
    overwrite: false,
    resource_type: 'image',
    unique_filename: false,
    use_filename: false,
    tags: ['legacy-migration', mapCloudinaryFolder(legacyPath).split('/')[0]],
  });
  return {
    publicId: res.public_id,
    secureUrl: res.secure_url,
    url: res.url,
    format: res.format,
    width: res.width,
    height: res.height,
    bytes: res.bytes,
    folder: mapCloudinaryFolder(legacyPath),
    legacyPath,
  };
}

async function main() {
  const images: string[] = load(path.join(DATA_DIR, 'images.json'), []);
  if (!images.length) {
    console.error('No seed/data/images.json — run `npm run seed:extract` first.');
    process.exit(1);
  }

  const mediaMap: Record<string, MediaEntry> = load(MEDIA_MAP, {});
  const done: Record<string, boolean> = load(CHECKPOINT, {});
  const pending = images.filter((p) => !done[p]);

  console.log(`${images.length} images total, ${pending.length} pending`);

  let processed = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map((p) => uploadOne(p)));

    results.forEach((r, idx) => {
      const legacyPath = batch[idx];
      if (r.status === 'fulfilled' && r.value) {
        mediaMap[legacyPath] = r.value;
        done[legacyPath] = true;
        processed++;
      } else if (r.status === 'fulfilled') {
        done[legacyPath] = true; // missing file — do not retry forever
      } else {
        failed++;
        console.error(`  x ${legacyPath}: ${(r.reason as Error).message}`);
      }
    });

    fs.writeFileSync(MEDIA_MAP, JSON.stringify(mediaMap, null, 2));
    fs.writeFileSync(CHECKPOINT, JSON.stringify(done, null, 2));
    process.stdout.write(`\r  uploaded ${processed}/${pending.length} (${failed} failed)`);
  }

  console.log(`\nDone. media-map.json has ${Object.keys(mediaMap).length} entries.`);
  if (failed) console.log('Re-run this command to retry the failures.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
